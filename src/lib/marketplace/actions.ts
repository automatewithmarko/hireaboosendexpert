'use server';

import type { User } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  getCurrentUserContext,
  type MarketplaceAccountContext,
} from '@/lib/auth/session';
import { getMarketplaceAdminClient } from '@/lib/supabase/marketplace-admin';

const AVATAR_COLORS = [
  '#475569',
  '#22c55e',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#06b6d4',
  '#ec4899',
  '#14b8a6',
];

function redirectToSignIn(nextPath: string) {
  redirect(`/signin?next=${encodeURIComponent(nextPath)}`);
}

function pickAvatarColor(seed: string) {
  const sum = Array.from(seed).reduce((total, char) => total + char.charCodeAt(0), 0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

function getInitials(value: string) {
  const parts = value
    .split(' ')
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 2);

  return parts.map((part) => part[0]?.toUpperCase() ?? '').join('') || 'BE';
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseFeatureText(value: string) {
  return value
    .split('\n')
    .flatMap((line) => line.split(','))
    .map((item) => item.trim())
    .filter(Boolean);
}

async function uploadGigMediaFiles(input: {
  accountId: string;
  gigId: number;
  coverFile?: File | null;
  galleryFiles: File[];
}) {
  const files = [
    ...(input.coverFile ? [input.coverFile] : []),
    ...input.galleryFiles,
  ];

  if (files.length === 0) {
    return;
  }

  const db = getMarketplaceAdminClient();
  const uploadRows: Array<{
    gig_id: number;
    media_type: string;
    public_url: string;
    storage_path: string;
    sort_order: number;
    alt_text: string;
  }> = [];

  for (const [index, file] of files.slice(0, 6).entries()) {
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const safeName = `${Date.now()}-${index}-${slugify(
      file.name.replace(/\.[^.]+$/, ''),
    )}.${file.name.split('.').pop() ?? 'jpg'}`;
    const storagePath = `${input.accountId}/${input.gigId}/${safeName}`;

    const { error: uploadError } = await db.storage
      .from('gig-media')
      .upload(storagePath, fileBuffer, {
        contentType: file.type || 'image/jpeg',
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Unable to upload gig image: ${uploadError.message}`);
    }

    const { data: publicUrlData } = db.storage
      .from('gig-media')
      .getPublicUrl(storagePath);

    uploadRows.push({
      gig_id: input.gigId,
      media_type: 'image',
      public_url: publicUrlData.publicUrl,
      storage_path: storagePath,
      sort_order: index + 1,
        alt_text: index === 0 && input.coverFile ? 'Cover image' : file.name,
    });
  }

  if (uploadRows.length > 0) {
    const { error } = await db.from('gig_media').insert(uploadRows);
    if (error) {
      throw new Error(`Unable to save gig images: ${error.message}`);
    }
  }
}

interface ViewerContext {
  user: User;
  marketplace: MarketplaceAccountContext;
}

async function requireViewer(nextPath: string): Promise<ViewerContext> {
  const context = await getCurrentUserContext();

  if (!context.user || !context.marketplace) {
    redirectToSignIn(nextPath);
  }

  return {
    user: context.user!,
    marketplace: context.marketplace!,
  };
}

async function requireAdmin(nextPath: string): Promise<ViewerContext> {
  const context = await requireViewer(nextPath);

  if (!context.marketplace.isAdmin) {
    redirect('/');
  }

  return context;
}

function formatResponseTimeInterval(intervalStr: string | null): string {
  if (!intervalStr || intervalStr === '00:00:00') {
    return 'Usually replies soon';
  }

  const parts = intervalStr.match(
    /(?:(\d+)\s*days?\s*)?(\d{1,2}):(\d{2}):(\d{2})/,
  );

  if (!parts) {
    return 'Usually replies soon';
  }

  const days = parseInt(parts[1] ?? '0', 10);
  const hours = parseInt(parts[2] ?? '0', 10);
  const minutes = parseInt(parts[3] ?? '0', 10);
  const totalMinutes = days * 24 * 60 + hours * 60 + minutes;

  if (totalMinutes < 5) return 'Within minutes';
  if (totalMinutes < 60) return `${totalMinutes} min`;
  if (totalMinutes < 120) return '1 hour';
  if (totalMinutes < 60 * 24) return `${Math.round(totalMinutes / 60)} hours`;
  if (totalMinutes < 60 * 48) return '1 day';
  return `${Math.round(totalMinutes / (60 * 24))} days`;
}

async function refreshExpertResponseTime(expertAccountId: string) {
  const db = getMarketplaceAdminClient();
  const { data } = await db.rpc('compute_expert_response_time', {
    expert_account: expertAccountId,
  });

  if (data) {
    const displayTime = formatResponseTimeInterval(data);
    await db
      .from('expert_profiles')
      .update({ response_time: displayTime })
      .eq('account_id', expertAccountId);
  }
}

async function syncExpertRatings(expertAccountId: string, gigId: number) {
  const marketplace = getMarketplaceAdminClient();
  const { data: reviewRows, error: reviewsError } = await marketplace
    .from('reviews')
    .select('*')
    .eq('reviewee_account_id', expertAccountId);

  if (reviewsError) {
    throw new Error(`Unable to refresh expert ratings: ${reviewsError.message}`);
  }

  const reviews = reviewRows ?? [];
  const reviewCount = reviews.length;
  const averageRating =
    reviewCount > 0
      ? Number(
          (
            reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
          ).toFixed(1),
        )
      : 0;

  await marketplace
    .from('expert_profiles')
    .update({
      rating: averageRating,
      reviews_count: reviewCount,
    })
    .eq('account_id', expertAccountId);

  const { data: orderRows, error: ordersError } = await marketplace
    .from('orders')
    .select('*')
    .eq('gig_id', gigId);

  if (ordersError) {
    throw new Error(`Unable to refresh gig ratings: ${ordersError.message}`);
  }

  const orderIds = (orderRows ?? []).map((order) => order.id);
  const { data: gigReviewRows, error: gigReviewsError } = await marketplace
    .from('reviews')
    .select('*')
    .in('order_id', orderIds.length > 0 ? orderIds : [-1]);

  if (gigReviewsError) {
    throw new Error(`Unable to refresh gig reviews: ${gigReviewsError.message}`);
  }

  const gigReviews = gigReviewRows ?? [];
  const gigReviewCount = gigReviews.length;
  const gigAverageRating =
    gigReviewCount > 0
      ? Number(
          (
            gigReviews.reduce((sum, review) => sum + review.rating, 0) / gigReviewCount
          ).toFixed(1),
        )
      : 0;

  await marketplace
    .from('gigs')
    .update({
      rating: gigAverageRating,
      reviews_count: gigReviewCount,
    })
    .eq('id', gigId);
}

export async function sendConversationMessageAction(input: {
  conversationId: number;
  body: string;
}) {
  const { marketplace } = await requireViewer('/inbox');
  const body = input.body.trim();

  if (!body) {
    return { error: 'Message cannot be empty.' };
  }

  const db = getMarketplaceAdminClient();
  const { data: participantRow, error: participantError } = await db
    .from('conversation_participants')
    .select('*')
    .eq('conversation_id', input.conversationId)
    .eq('account_id', marketplace.account.id)
    .maybeSingle();

  if (participantError || !participantRow) {
    return { error: 'Conversation not found.' };
  }

  const { data: messageRow, error: messageError } = await db
    .from('messages')
    .insert({
      conversation_id: input.conversationId,
      sender_account_id: marketplace.account.id,
      body,
    })
    .select('*')
    .single();

  if (messageError || !messageRow) {
    return { error: messageError?.message ?? 'Unable to send message.' };
  }

  await db
    .from('conversations')
    .update({
      last_message_at: messageRow.created_at,
      last_message_preview: body,
    })
    .eq('id', input.conversationId);

  await db
    .from('conversation_participants')
    .update({
      last_read_message_id: messageRow.id,
    })
    .eq('conversation_id', input.conversationId)
    .eq('account_id', marketplace.account.id);

  const { data: otherParticipants } = await db
    .from('conversation_participants')
    .select('*')
    .eq('conversation_id', input.conversationId)
    .neq('account_id', marketplace.account.id);

  const senderName =
    marketplace.account.full_name ?? marketplace.account.email.split('@')[0] ?? 'Someone';

  for (const participant of otherParticipants ?? []) {
    // Check for an existing unread message notification for this conversation
    const { data: existing } = await db
      .from('notifications')
      .select('id, body')
      .eq('account_id', participant.account_id)
      .eq('kind', 'message')
      .eq('related_conversation_id', input.conversationId)
      .is('read_at', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing) {
      const countMatch = existing.body?.match(/^(\d+) new messages$/);
      const currentCount = countMatch ? parseInt(countMatch[1], 10) : 1;
      await db.from('notifications').delete().eq('id', existing.id);
      await db.from('notifications').insert({
        account_id: participant.account_id,
        kind: 'message' as const,
        title: senderName,
        body: `${currentCount + 1} new messages`,
        related_conversation_id: input.conversationId,
      });
    } else {
      await db.from('notifications').insert({
        account_id: participant.account_id,
        kind: 'message' as const,
        title: senderName,
        body,
        related_conversation_id: input.conversationId,
      });
    }
  }

  if (marketplace.roles.includes('expert')) {
    refreshExpertResponseTime(marketplace.account.id).catch(() => {});
  }

  revalidatePath('/inbox');
  return { success: true };
}

export async function submitOrderReviewAction(input: {
  orderId: number;
  rating: number;
  text: string;
}) {
  const { marketplace } = await requireViewer(`/orders/${input.orderId}`);
  const db = getMarketplaceAdminClient();
  const text = input.text.trim();

  if (!text || input.rating < 1 || input.rating > 5) {
    return { error: 'Please provide a rating and review text.' };
  }

  const { data: orderRow, error: orderError } = await db
    .from('orders')
    .select('*')
    .eq('id', input.orderId)
    .maybeSingle();

  if (orderError || !orderRow) {
    return { error: 'Order not found.' };
  }

  if (orderRow.customer_account_id !== marketplace.account.id) {
    return { error: 'You can only review your own completed orders.' };
  }

  if (orderRow.status !== 'completed') {
    return { error: 'Reviews are only available after completion.' };
  }

  const { data: existingReview } = await db
    .from('reviews')
    .select('*')
    .eq('order_id', input.orderId)
    .maybeSingle();

  if (existingReview) {
    return { error: 'This order already has a review.' };
  }

  const reviewerName =
    marketplace.account.full_name ?? marketplace.account.email ?? 'BooSend User';

  const { error: reviewInsertError } = await db.from('reviews').insert({
    order_id: input.orderId,
    rating: input.rating,
    body: text,
    reviewee_account_id: orderRow.expert_account_id,
    reviewer_account_id: marketplace.account.id,
    reviewer_display_name: reviewerName,
    reviewer_avatar_color: pickAvatarColor(marketplace.account.id),
  });

  if (reviewInsertError) {
    return { error: reviewInsertError.message };
  }

  await db.from('order_events').insert({
    order_id: input.orderId,
    actor_account_id: marketplace.account.id,
    event_type: 'review_created',
    label: 'Buyer left a review',
    body: text,
  });

  await syncExpertRatings(orderRow.expert_account_id, orderRow.gig_id);

  const { data: expertProfileRow } = await db
    .from('expert_profiles')
    .select('*')
    .eq('account_id', orderRow.expert_account_id)
    .maybeSingle();

  revalidatePath('/orders');
  revalidatePath(`/orders/${input.orderId}`);

  if (expertProfileRow) {
    revalidatePath(`/listing/${expertProfileRow.public_id}`);
    revalidatePath(`/profile/${expertProfileRow.public_id}`);
  }

  revalidatePath('/');
  return { success: true };
}

export async function submitExpertApplicationAction(formData: FormData) {
  const { marketplace } = await requireViewer('/expert/onboarding');
  const db = getMarketplaceAdminClient();

  const username = String(formData.get('username') ?? '').trim().toLowerCase();
  const headline = String(formData.get('headline') ?? '').trim();
  const bio = String(formData.get('bio') ?? '').trim();
  const location = String(formData.get('location') ?? '').trim();
  const skillsInput = String(formData.get('skills') ?? '').trim();
  const serviceTitle = String(formData.get('serviceTitle') ?? '').trim();
  const serviceDescription = String(formData.get('serviceDescription') ?? '').trim();
  const skills = skillsInput
    .split(',')
    .map((skill) => skill.trim())
    .filter(Boolean);

  if (!username || !bio || !serviceTitle || !serviceDescription) {
    redirect('/expert/onboarding?error=missing-fields');
  }

  const fullName =
    marketplace.account.full_name ?? marketplace.account.email ?? 'BooSend Expert';

  const { error: profileError } = await db.from('expert_profiles').upsert({
    account_id: marketplace.account.id,
    username,
    headline: headline || null,
    bio,
    location: location || null,
    skills,
    service_title: serviceTitle,
    service_description: serviceDescription,
    member_since: new Intl.DateTimeFormat('en-US', {
      month: 'short',
      year: 'numeric',
    }).format(new Date()),
    avatar_text: getInitials(fullName),
    avatar_color: pickAvatarColor(marketplace.account.id),
    application_status: 'submitted',
  });

  if (profileError) {
    redirect('/expert/onboarding?error=profile-save-failed');
  }

  await db.from('account_roles').upsert({
    account_id: marketplace.account.id,
    role: 'expert',
  });

  const { error: applicationError } = await db.from('expert_applications').insert({
    account_id: marketplace.account.id,
    status: 'submitted',
    submitted_at: new Date().toISOString(),
    motivation: serviceTitle,
    notes: [
      headline && `Headline: ${headline}`,
      bio && `Bio: ${bio}`,
      location && `Location: ${location}`,
      skills.length > 0 && `Skills: ${skills.join(', ')}`,
      `Service title: ${serviceTitle}`,
      `Service description: ${serviceDescription}`,
    ]
      .filter(Boolean)
      .join('\n'),
  });

  if (applicationError) {
    redirect('/expert/onboarding?error=application-save-failed');
  }

  revalidatePath('/account');
  revalidatePath('/expert/onboarding');
  revalidatePath('/admin');
  redirect('/expert/onboarding?submitted=1');
}

export async function createGigAction(formData: FormData) {
  const { marketplace } = await requireViewer('/expert/gigs/new');
  const db = getMarketplaceAdminClient();

  if (marketplace.expertProfile?.application_status !== 'approved') {
    redirect('/expert/onboarding');
  }

  const title = String(formData.get('title') ?? '').trim();
  const category = String(formData.get('category') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const coverGradient = String(formData.get('coverGradient') ?? '').trim();
  const coverFile = formData.get('coverFile');
  const packageCount = Math.min(
    3,
    Math.max(1, Number(formData.get('packageCount') ?? 1)),
  );
  const requirements = String(formData.get('requirements') ?? '').trim();
  const galleryFiles = formData
    .getAll('galleryFiles')
    .filter((value): value is File => value instanceof File && value.size > 0);
  const packageEntries = Array.from({ length: packageCount }, (_, index) => {
    const slot = index + 1;
    const name = String(formData.get(`package${slot}Name`) ?? '').trim();
    const subtitle = String(formData.get(`package${slot}Subtitle`) ?? '').trim();
    const price = Number(formData.get(`package${slot}Price`) ?? 0);
    const deliveryDays = Number(formData.get(`package${slot}Delivery`) ?? 0);
    const revisions = Number(formData.get(`package${slot}Revisions`) ?? 1);
    const descriptionText = String(
      formData.get(`package${slot}Description`) ?? '',
    ).trim();
    const features = parseFeatureText(
      String(formData.get(`package${slot}Features`) ?? ''),
    );

    return {
      tier_name: name || `Package ${slot}`,
      subtitle: subtitle || null,
      price,
      delivery_days: deliveryDays,
      revisions,
      description: descriptionText || description,
      features:
        features.length > 0
          ? features
          : ['Kickoff call', 'Workflow build', 'Delivery handoff'],
      sort_order: slot,
    };
  }).filter((pkg) => pkg.price > 0 && pkg.delivery_days > 0);

  if (!title || !category || !description || packageEntries.length === 0) {
    redirect('/expert/gigs/new?error=missing-fields');
  }

  const { data: gigRow, error: gigError } = await db
    .from('gigs')
    .insert({
      expert_account_id: marketplace.account.id,
      title,
      slug: `${slugify(title).slice(0, 60) || 'gig'}-${Date.now().toString().slice(-6)}`,
      category,
      base_price: packageEntries[0]?.price ?? 0,
      delivery_days: packageEntries[0]?.delivery_days ?? null,
      short_description: description,
      cover_gradient: coverGradient || null,
      status: 'pending_review',
      badge: null,
    })
    .select('*')
    .single();

  if (gigError || !gigRow) {
    redirect('/expert/gigs/new?error=gig-create-failed');
  }

  const { error: packagesError } = await db.from('gig_packages').insert(
    packageEntries.map((pkg) => ({
      gig_id: gigRow.id,
      ...pkg,
    })),
  );

  if (packagesError) {
    redirect('/expert/gigs/new?error=package-create-failed');
  }

  if (
    (coverFile instanceof File && coverFile.size > 0) ||
    galleryFiles.length > 0
  ) {
    try {
      await uploadGigMediaFiles({
        accountId: marketplace.account.id,
        gigId: gigRow.id,
        coverFile: coverFile instanceof File && coverFile.size > 0 ? coverFile : null,
        galleryFiles,
      });
    } catch {
      redirect('/expert/gigs/new?error=image-upload-failed');
    }
  }

  const requirementItems = requirements
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);

  if (requirementItems.length > 0) {
    await db.from('gig_requirement_fields').insert(
      requirementItems.map((label, index) => ({
        gig_id: gigRow.id,
        label,
        sort_order: index + 1,
      })),
    );
  }

  revalidatePath('/expert/dashboard');
  revalidatePath('/expert/gigs/new');
  revalidatePath('/admin');
  redirect('/expert/dashboard?gigCreated=1');
}

export async function placeTestOrderAction(formData: FormData) {
  const { marketplace } = await requireViewer('/checkout');
  const db = getMarketplaceAdminClient();

  const gigId = Number(formData.get('gigId') ?? 0);
  const packageId = Number(formData.get('packageId') ?? 0);
  const notes = String(formData.get('notes') ?? '').trim();

  if (!gigId || !packageId) {
    redirect(`/checkout/${gigId || ''}?error=missing-package`);
  }

  const [{ data: gigRow, error: gigError }, { data: packageRow, error: packageError }] =
    await Promise.all([
      db.from('gigs').select('*').eq('id', gigId).eq('status', 'published').maybeSingle(),
      db.from('gig_packages').select('*').eq('id', packageId).eq('gig_id', gigId).maybeSingle(),
    ]);

  if (gigError || !gigRow || packageError || !packageRow) {
    redirect(`/checkout/${gigId}?package=${packageId}&error=package-unavailable`);
  }

  const serviceFee = Math.round(packageRow.price * 0.1);
  const total = packageRow.price + serviceFee;
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + packageRow.delivery_days);

  const { data: orderRow, error: orderError } = await db
    .from('orders')
    .insert({
      customer_account_id: marketplace.account.id,
      expert_account_id: gigRow.expert_account_id,
      gig_id: gigId,
      gig_package_id: packageId,
      package_name_snapshot: packageRow.tier_name,
      title_snapshot: gigRow.title,
      price: packageRow.price,
      service_fee: serviceFee,
      total,
      delivery_due_at: dueDate.toISOString(),
      status: 'pending',
      payment_status: 'pending',
    })
    .select('*')
    .single();

  if (orderError || !orderRow) {
    redirect(`/checkout/${gigId}?package=${packageId}&error=order-create-failed`);
  }

  await db.from('order_requirements').insert({
    order_id: orderRow.id,
    payload: {
      notes,
    },
  });

  await db.from('order_events').insert([
    {
      order_id: orderRow.id,
      actor_account_id: marketplace.account.id,
      event_type: 'order_created',
      label: 'Order placed',
      body: 'Buyer created a new order.',
    },
    {
      order_id: orderRow.id,
      actor_account_id: marketplace.account.id,
      event_type: 'requirements_submitted',
      label: 'Buyer shared requirements',
      body: notes || 'Requirements will be shared in chat.',
    },
  ]);

  await db.from('notifications').insert({
    account_id: gigRow.expert_account_id,
    kind: 'order',
    title: 'New order received',
    body: gigRow.title,
    related_order_id: orderRow.id,
  });

  revalidatePath('/orders');
  revalidatePath('/expert/orders');
  redirect(`/orders/${orderRow.id}`);
}

export async function reviewExpertApplicationAction(formData: FormData) {
  const { marketplace } = await requireAdmin('/admin');
  const db = getMarketplaceAdminClient();
  const applicationId = Number(formData.get('applicationId') ?? 0);
  const decision = String(formData.get('decision') ?? '').trim();
  const rejectionReason = String(formData.get('rejectionReason') ?? '').trim();

  if (!applicationId || (decision !== 'approve' && decision !== 'reject')) {
    redirect('/admin');
  }

  const { data: applicationRow, error: applicationError } = await db
    .from('expert_applications')
    .select('*')
    .eq('id', applicationId)
    .maybeSingle();

  if (applicationError || !applicationRow) {
    redirect('/admin');
  }

  const nextStatus = decision === 'approve' ? 'approved' : 'rejected';
  const reviewedAt = new Date().toISOString();

  await db.from('expert_applications').update({
    status: nextStatus,
    reviewer_account_id: marketplace.account.id,
    reviewed_at: reviewedAt,
    rejection_reason: decision === 'reject' ? rejectionReason || 'Needs more detail.' : null,
  }).eq('id', applicationId);

  await db.from('expert_profiles').update({
    application_status: nextStatus,
    approved_at: decision === 'approve' ? reviewedAt : null,
  }).eq('account_id', applicationRow.account_id);

  if (decision === 'approve') {
    await db.from('account_roles').upsert({
      account_id: applicationRow.account_id,
      role: 'expert',
    });
  }

  await db.from('notifications').insert({
    account_id: applicationRow.account_id,
    kind: 'application',
    title: decision === 'approve' ? 'Expert profile approved' : 'Expert profile needs updates',
    body:
      decision === 'approve'
        ? 'You can now submit gigs for review.'
        : rejectionReason || 'Please update your application and resubmit.',
  });

  revalidatePath('/admin');
  revalidatePath('/expert/onboarding');
  redirect('/admin');
}

export async function postGigCommentAction(input: {
  gigId: number;
  parentCommentId: number | null;
  body: string;
}) {
  const { marketplace } = await requireViewer('/');
  const db = getMarketplaceAdminClient();
  const body = input.body.trim();

  if (!body || body.length > 2000) {
    return { error: 'Comment must be between 1 and 2000 characters.' };
  }

  const { data: gigRow, error: gigError } = await db
    .from('gigs')
    .select('*')
    .eq('id', input.gigId)
    .eq('status', 'published')
    .maybeSingle();

  if (gigError || !gigRow) {
    return { error: 'Gig not found.' };
  }

  if (input.parentCommentId !== null) {
    const { data: parent } = await db
      .from('gig_comments')
      .select('*')
      .eq('id', input.parentCommentId)
      .eq('gig_id', input.gigId)
      .maybeSingle();

    if (!parent) {
      return { error: 'Parent comment not found.' };
    }

    if (parent.parent_comment_id !== null) {
      return { error: 'Cannot reply to a reply.' };
    }
  }

  const { error: insertError } = await db.from('gig_comments').insert({
    gig_id: input.gigId,
    account_id: marketplace.account.id,
    parent_comment_id: input.parentCommentId,
    body,
  });

  if (insertError) {
    return { error: insertError.message };
  }

  if (gigRow.expert_account_id !== marketplace.account.id) {
    await db.from('notifications').insert({
      account_id: gigRow.expert_account_id,
      kind: 'system' as const,
      title: 'New comment on your gig',
      body: body.slice(0, 100),
    });
  }

  const { data: profileRow } = await db
    .from('expert_profiles')
    .select('public_id')
    .eq('account_id', gigRow.expert_account_id)
    .maybeSingle();

  if (profileRow) {
    revalidatePath(`/listing/${profileRow.public_id}`);
  }

  return { success: true };
}

export async function markNotificationReadAction(notificationId: number) {
  const { marketplace } = await requireViewer('/');
  const db = getMarketplaceAdminClient();

  await db
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', notificationId)
    .eq('account_id', marketplace.account.id);

  revalidatePath('/');
  return { success: true };
}

export async function markAllNotificationsReadAction() {
  const { marketplace } = await requireViewer('/');
  const db = getMarketplaceAdminClient();

  await db
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('account_id', marketplace.account.id)
    .is('read_at', null);

  revalidatePath('/');
  return { success: true };
}

export async function markConversationReadAction(conversationId: number) {
  const { marketplace } = await requireViewer('/inbox');
  const db = getMarketplaceAdminClient();

  const { data: latestMessage } = await db
    .from('messages')
    .select('id')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latestMessage) {
    await db
      .from('conversation_participants')
      .update({ last_read_message_id: latestMessage.id })
      .eq('conversation_id', conversationId)
      .eq('account_id', marketplace.account.id);
  }

  // Mark all unread message notifications for this conversation as read
  await db
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('account_id', marketplace.account.id)
    .eq('kind', 'message')
    .eq('related_conversation_id', conversationId)
    .is('read_at', null);

  return { success: true };
}

export async function placeOrderAction(input: {
  gigId: number;
  packageId: number;
  notes: string;
  customOfferId?: number;
}) {
  const { marketplace } = await requireViewer('/checkout');
  const db = getMarketplaceAdminClient();

  const [{ data: gigRow, error: gigError }, { data: packageRow, error: packageError }] =
    await Promise.all([
      db.from('gigs').select('*').eq('id', input.gigId).eq('status', 'published').maybeSingle(),
      db.from('gig_packages').select('*').eq('id', input.packageId).eq('gig_id', input.gigId).maybeSingle(),
    ]);

  if (gigError || !gigRow || packageError || !packageRow) {
    return { error: 'Package or gig not available.' };
  }

  if (gigRow.expert_account_id === marketplace.account.id) {
    return { error: 'You cannot order your own gig.' };
  }

  const serviceFee = Math.round(packageRow.price * 0.1);
  const total = packageRow.price + serviceFee;
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + packageRow.delivery_days);

  const { data: orderRow, error: orderError } = await db
    .from('orders')
    .insert({
      customer_account_id: marketplace.account.id,
      expert_account_id: gigRow.expert_account_id,
      gig_id: input.gigId,
      gig_package_id: input.packageId,
      package_name_snapshot: packageRow.tier_name,
      title_snapshot: gigRow.title,
      price: packageRow.price,
      service_fee: serviceFee,
      total,
      delivery_due_at: dueDate.toISOString(),
      status: 'pending',
      payment_status: 'paid',
    })
    .select('*')
    .single();

  if (orderError || !orderRow) {
    return { error: 'Unable to create order.' };
  }

  await db.from('order_requirements').insert({
    order_id: orderRow.id,
    payload: { notes: input.notes },
  });

  await db.from('order_events').insert([
    {
      order_id: orderRow.id,
      actor_account_id: marketplace.account.id,
      event_type: 'order_created',
      label: 'Order placed',
      body: 'Buyer created a new order.',
    },
    {
      order_id: orderRow.id,
      actor_account_id: marketplace.account.id,
      event_type: 'payment_completed',
      label: 'Payment processed',
      body: 'Payment via BooSend Wallet.',
    },
    {
      order_id: orderRow.id,
      actor_account_id: marketplace.account.id,
      event_type: 'requirements_submitted',
      label: 'Buyer shared requirements',
      body: input.notes || 'Requirements will be shared in chat.',
    },
  ]);

  await db.from('notifications').insert({
    account_id: gigRow.expert_account_id,
    kind: 'order',
    title: 'New order received',
    body: gigRow.title,
    related_order_id: orderRow.id,
  });

  if (input.customOfferId) {
    await db.from('custom_offers').update({
      status: 'accepted',
      accepted_at: new Date().toISOString(),
      order_id: orderRow.id,
    }).eq('id', input.customOfferId);
  }

  revalidatePath('/orders');
  revalidatePath('/expert/orders');
  return { success: true, orderId: orderRow.id };
}

export async function startOrderAction(orderId: number) {
  const { marketplace } = await requireViewer(`/orders/${orderId}`);
  const db = getMarketplaceAdminClient();

  const { data: orderRow, error } = await db
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .maybeSingle();

  if (error || !orderRow) return { error: 'Order not found.' };
  if (orderRow.expert_account_id !== marketplace.account.id) return { error: 'Not authorized.' };
  if (orderRow.status !== 'pending') return { error: 'Order cannot be started in current state.' };

  await db.from('orders').update({
    status: 'in_progress',
    delivery_status: 'not_started',
  }).eq('id', orderId);

  await db.from('order_events').insert({
    order_id: orderId,
    actor_account_id: marketplace.account.id,
    event_type: 'work_started',
    label: 'Expert started working',
    body: 'The expert has started working on your order.',
  });

  await db.from('notifications').insert({
    account_id: orderRow.customer_account_id,
    kind: 'order',
    title: 'Expert started working',
    body: orderRow.title_snapshot,
    related_order_id: orderId,
  });

  revalidatePath('/orders');
  revalidatePath(`/orders/${orderId}`);
  revalidatePath('/expert/orders');
  return { success: true };
}

export async function deliverOrderAction(input: { orderId: number; message: string }) {
  const { marketplace } = await requireViewer(`/orders/${input.orderId}`);
  const db = getMarketplaceAdminClient();

  const { data: orderRow, error } = await db
    .from('orders')
    .select('*')
    .eq('id', input.orderId)
    .maybeSingle();

  if (error || !orderRow) return { error: 'Order not found.' };
  if (orderRow.expert_account_id !== marketplace.account.id) return { error: 'Not authorized.' };
  if (orderRow.status !== 'in_progress' && orderRow.status !== 'revision_requested') {
    return { error: 'Order cannot be delivered in current state.' };
  }

  await db.from('orders').update({
    status: 'delivered',
    delivery_status: 'submitted',
  }).eq('id', input.orderId);

  await db.from('order_events').insert({
    order_id: input.orderId,
    actor_account_id: marketplace.account.id,
    event_type: 'delivery_submitted',
    label: 'Delivery submitted',
    body: input.message || 'The expert has delivered the work.',
  });

  await db.from('notifications').insert({
    account_id: orderRow.customer_account_id,
    kind: 'order',
    title: 'Order delivered',
    body: 'Review the delivery and accept or request revisions.',
    related_order_id: input.orderId,
  });

  revalidatePath('/orders');
  revalidatePath(`/orders/${input.orderId}`);
  revalidatePath('/expert/orders');
  return { success: true };
}

export async function acceptDeliveryAction(orderId: number) {
  const { marketplace } = await requireViewer(`/orders/${orderId}`);
  const db = getMarketplaceAdminClient();

  const { data: orderRow, error } = await db
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .maybeSingle();

  if (error || !orderRow) return { error: 'Order not found.' };
  if (orderRow.customer_account_id !== marketplace.account.id) return { error: 'Not authorized.' };
  if (orderRow.status !== 'delivered') return { error: 'Order is not in delivered state.' };

  const completedAt = new Date().toISOString();

  await db.from('orders').update({
    status: 'completed',
    delivery_status: 'accepted',
    payment_status: 'released',
    completed_at: completedAt,
  }).eq('id', orderId);

  await db.from('order_events').insert({
    order_id: orderId,
    actor_account_id: marketplace.account.id,
    event_type: 'delivery_accepted',
    label: 'Delivery accepted',
    body: 'The buyer accepted the delivery.',
  });

  const { data: profile } = await db
    .from('expert_profiles')
    .select('completed_orders')
    .eq('account_id', orderRow.expert_account_id)
    .maybeSingle();

  if (profile) {
    await db.from('expert_profiles').update({
      completed_orders: (profile.completed_orders ?? 0) + 1,
    }).eq('account_id', orderRow.expert_account_id);
  }

  await db.from('notifications').insert({
    account_id: orderRow.expert_account_id,
    kind: 'order',
    title: 'Delivery accepted',
    body: 'Payment has been released to your account.',
    related_order_id: orderId,
  });

  revalidatePath('/orders');
  revalidatePath(`/orders/${orderId}`);
  revalidatePath('/expert/orders');
  return { success: true };
}

export async function requestRevisionAction(input: { orderId: number; message: string }) {
  const { marketplace } = await requireViewer(`/orders/${input.orderId}`);
  const db = getMarketplaceAdminClient();

  const { data: orderRow, error } = await db
    .from('orders')
    .select('*')
    .eq('id', input.orderId)
    .maybeSingle();

  if (error || !orderRow) return { error: 'Order not found.' };
  if (orderRow.customer_account_id !== marketplace.account.id) return { error: 'Not authorized.' };
  if (orderRow.status !== 'delivered') return { error: 'Order is not in delivered state.' };

  await db.from('orders').update({
    status: 'revision_requested',
    delivery_status: 'revision_requested',
  }).eq('id', input.orderId);

  await db.from('order_events').insert({
    order_id: input.orderId,
    actor_account_id: marketplace.account.id,
    event_type: 'revision_requested',
    label: 'Revision requested',
    body: input.message || 'The buyer requested changes.',
  });

  await db.from('notifications').insert({
    account_id: orderRow.expert_account_id,
    kind: 'order',
    title: 'Revision requested',
    body: input.message || 'The buyer requested changes to the delivery.',
    related_order_id: input.orderId,
  });

  revalidatePath('/orders');
  revalidatePath(`/orders/${input.orderId}`);
  revalidatePath('/expert/orders');
  return { success: true };
}

export async function createCustomOfferAction(input: {
  conversationId: number;
  description: string;
  price: number;
  deliveryDays: number;
  revisions: number;
  gigId?: number;
}) {
  const { marketplace } = await requireViewer('/inbox');
  const db = getMarketplaceAdminClient();

  if (!marketplace.roles.includes('expert')) {
    return { error: 'Only experts can send custom offers.' };
  }

  if (input.price <= 0 || input.deliveryDays <= 0 || !input.description.trim()) {
    return { error: 'Please fill in all required fields.' };
  }

  const { data: participant } = await db
    .from('conversation_participants')
    .select('*')
    .eq('conversation_id', input.conversationId)
    .eq('account_id', marketplace.account.id)
    .maybeSingle();

  if (!participant) return { error: 'Conversation not found.' };

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const { data: offerRow, error: offerError } = await db
    .from('custom_offers')
    .insert({
      conversation_id: input.conversationId,
      sender_account_id: marketplace.account.id,
      gig_id: input.gigId || null,
      description: input.description.trim(),
      price: input.price,
      delivery_days: input.deliveryDays,
      revisions: input.revisions,
      status: 'pending',
      expires_at: expiresAt.toISOString(),
    })
    .select('*')
    .single();

  if (offerError || !offerRow) return { error: 'Unable to create offer.' };

  const body = `Custom offer: ${input.description.trim().slice(0, 100)} — $${input.price}`;

  const { data: messageRow } = await db
    .from('messages')
    .insert({
      conversation_id: input.conversationId,
      sender_account_id: marketplace.account.id,
      body,
      message_type: 'custom_offer',
      custom_offer_id: offerRow.id,
    })
    .select('*')
    .single();

  if (messageRow) {
    await db.from('conversations').update({
      last_message_at: messageRow.created_at,
      last_message_preview: body,
    }).eq('id', input.conversationId);

    await db.from('conversation_participants').update({
      last_read_message_id: messageRow.id,
    }).eq('conversation_id', input.conversationId)
      .eq('account_id', marketplace.account.id);
  }

  const { data: otherParticipants } = await db
    .from('conversation_participants')
    .select('*')
    .eq('conversation_id', input.conversationId)
    .neq('account_id', marketplace.account.id);

  if ((otherParticipants ?? []).length > 0) {
    await db.from('notifications').insert(
      otherParticipants!.map((p) => ({
        account_id: p.account_id,
        kind: 'message' as const,
        title: 'New custom offer',
        body: `$${input.price} — ${input.description.trim().slice(0, 60)}`,
        related_conversation_id: input.conversationId,
      })),
    );
  }

  revalidatePath('/inbox');
  return { success: true, offerId: offerRow.id };
}

export async function acceptCustomOfferAction(offerId: number) {
  const { marketplace } = await requireViewer('/inbox');
  const db = getMarketplaceAdminClient();

  const { data: offer, error: offerError } = await db
    .from('custom_offers')
    .select('*')
    .eq('id', offerId)
    .maybeSingle();

  if (offerError || !offer) return { error: 'Offer not found.' };
  if (offer.status !== 'pending') return { error: 'This offer is no longer available.' };
  if (new Date(offer.expires_at) < new Date()) {
    await db.from('custom_offers').update({ status: 'expired' }).eq('id', offerId);
    return { error: 'This offer has expired.' };
  }
  if (offer.sender_account_id === marketplace.account.id) {
    return { error: 'You cannot accept your own offer.' };
  }

  // Verify buyer is a participant
  const { data: participant } = await db
    .from('conversation_participants')
    .select('*')
    .eq('conversation_id', offer.conversation_id)
    .eq('account_id', marketplace.account.id)
    .maybeSingle();

  if (!participant) return { error: 'Not authorized.' };

  // Find the gig and package (or create from offer data)
  let gigId = offer.gig_id;
  let packageId: number | null = null;
  let gigTitle = 'Custom Order';

  if (gigId) {
    const { data: gig } = await db.from('gigs').select('*').eq('id', gigId).maybeSingle();
    if (gig) {
      gigTitle = gig.title;
      const { data: pkg } = await db
        .from('gig_packages')
        .select('*')
        .eq('gig_id', gigId)
        .order('sort_order', { ascending: true })
        .limit(1)
        .maybeSingle();
      packageId = pkg?.id ?? null;
    }
  }

  // If no gig, find any gig from this expert to use as a reference
  if (!gigId || !packageId) {
    const { data: expertGig } = await db
      .from('gigs')
      .select('*')
      .eq('expert_account_id', offer.sender_account_id)
      .eq('status', 'published')
      .limit(1)
      .maybeSingle();

    if (expertGig) {
      gigId = expertGig.id;
      gigTitle = expertGig.title;
      const { data: pkg } = await db
        .from('gig_packages')
        .select('*')
        .eq('gig_id', expertGig.id)
        .order('sort_order', { ascending: true })
        .limit(1)
        .maybeSingle();
      packageId = pkg?.id ?? null;
    }
  }

  if (!gigId || !packageId) return { error: 'Unable to create order from this offer.' };

  const serviceFee = Math.round(offer.price * 0.1);
  const total = offer.price + serviceFee;
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + offer.delivery_days);

  const { data: orderRow, error: orderError } = await db
    .from('orders')
    .insert({
      customer_account_id: marketplace.account.id,
      expert_account_id: offer.sender_account_id,
      gig_id: gigId,
      gig_package_id: packageId,
      package_name_snapshot: 'Custom Offer',
      title_snapshot: gigTitle,
      price: offer.price,
      service_fee: serviceFee,
      total,
      delivery_due_at: dueDate.toISOString(),
      status: 'pending',
      payment_status: 'paid',
    })
    .select('*')
    .single();

  if (orderError || !orderRow) return { error: 'Unable to create order.' };

  await db.from('order_requirements').insert({
    order_id: orderRow.id,
    payload: { notes: offer.description },
  });

  await db.from('order_events').insert([
    {
      order_id: orderRow.id,
      actor_account_id: marketplace.account.id,
      event_type: 'order_created',
      label: 'Order placed',
      body: 'Buyer accepted a custom offer.',
    },
    {
      order_id: orderRow.id,
      actor_account_id: marketplace.account.id,
      event_type: 'payment_completed',
      label: 'Payment processed',
      body: 'Payment via BooSend Wallet.',
    },
  ]);

  await db.from('custom_offers').update({
    status: 'accepted',
    accepted_at: new Date().toISOString(),
    order_id: orderRow.id,
  }).eq('id', offerId);

  // Send system message
  await db.from('messages').insert({
    conversation_id: offer.conversation_id,
    sender_account_id: marketplace.account.id,
    body: `Offer accepted! Order #${orderRow.order_number} has been created.`,
    message_type: 'system',
  });

  await db.from('notifications').insert({
    account_id: offer.sender_account_id,
    kind: 'order',
    title: 'Custom offer accepted',
    body: `Order #${orderRow.order_number} created — $${offer.price}`,
    related_order_id: orderRow.id,
  });

  revalidatePath('/inbox');
  revalidatePath('/orders');
  revalidatePath('/expert/orders');
  return { success: true, orderId: orderRow.id };
}

export async function withdrawCustomOfferAction(offerId: number) {
  const { marketplace } = await requireViewer('/inbox');
  const db = getMarketplaceAdminClient();

  const { data: offer } = await db
    .from('custom_offers')
    .select('*')
    .eq('id', offerId)
    .maybeSingle();

  if (!offer) return { error: 'Offer not found.' };
  if (offer.sender_account_id !== marketplace.account.id) return { error: 'Not authorized.' };
  if (offer.status !== 'pending') return { error: 'Offer cannot be withdrawn.' };

  await db.from('custom_offers').update({ status: 'withdrawn' }).eq('id', offerId);

  await db.from('messages').insert({
    conversation_id: offer.conversation_id,
    sender_account_id: marketplace.account.id,
    body: 'Custom offer was withdrawn.',
    message_type: 'system',
  });

  revalidatePath('/inbox');
  return { success: true };
}

export async function reviewGigAction(formData: FormData) {
  await requireAdmin('/admin');
  const db = getMarketplaceAdminClient();
  const gigId = Number(formData.get('gigId') ?? 0);
  const decision = String(formData.get('decision') ?? '').trim();

  if (!gigId || (decision !== 'publish' && decision !== 'archive')) {
    redirect('/admin');
  }

  await db.from('gigs').update({
    status: decision === 'publish' ? 'published' : 'archived',
    published_at: decision === 'publish' ? new Date().toISOString() : null,
  }).eq('id', gigId);

  revalidatePath('/');
  revalidatePath('/admin');
  revalidatePath('/expert/dashboard');
  redirect('/admin');
}
