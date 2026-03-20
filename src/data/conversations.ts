import { Conversation } from '@/types';

export const initialConversations: Conversation[] = [
  {
    sellerId: 4,
    lastMessage: "I'll send you the AI agent proposal by tomorrow. It'll include the RAG setup and tool integration specs.",
    time: '2 min ago',
    unread: true,
    messages: [
      { from: 'user', text: "Hi Emma, I'm interested in the AI agent package for our customer support team.", time: '10:30 AM' },
      { from: 'seller', text: "Hi! Thanks for reaching out. I'd love to help. Can you tell me more about your current support setup?", time: '10:32 AM' },
      { from: 'user', text: "We're using Zendesk right now, but we want an AI agent that can handle tier-1 tickets automatically via WhatsApp.", time: '10:35 AM' },
      { from: 'seller', text: "Perfect, I've done several Zendesk + WhatsApp AI agent integrations. The Standard package would be a great fit.", time: '10:38 AM' },
      { from: 'user', text: "That sounds good. Can you include RAG so it can learn from our knowledge base?", time: '10:40 AM' },
      { from: 'seller', text: "Absolutely! I'll send you the AI agent proposal by tomorrow. It'll include the RAG setup and tool integration specs.", time: '10:42 AM' },
    ],
  },
  {
    sellerId: 1,
    lastMessage: "The WhatsApp funnel is live! Check your BooSend dashboard for the analytics.",
    time: '1 hour ago',
    unread: true,
    messages: [
      { from: 'seller', text: "Hey! I just finished setting up the lead capture flow. Want me to walk you through it?", time: 'Yesterday 3:15 PM' },
      { from: 'user', text: "Yes please! Also, can we add a follow-up sequence for leads that don't respond?", time: 'Yesterday 3:20 PM' },
      { from: 'seller', text: "Already done! I set up a 3-step follow-up: Day 1, Day 3, and Day 7. Each message gets progressively more persuasive.", time: 'Yesterday 3:25 PM' },
      { from: 'user', text: "That's amazing. When can we go live?", time: 'Yesterday 4:00 PM' },
      { from: 'seller', text: "The WhatsApp funnel is live! Check your BooSend dashboard for the analytics.", time: '1 hour ago' },
    ],
  },
  {
    sellerId: 2,
    lastMessage: "Your Instagram DM funnel converted 47 leads this week! Here's the breakdown.",
    time: '3 hours ago',
    unread: false,
    messages: [
      { from: 'user', text: "Hi Sofia, the story triggers are working great. Can we add comment-to-DM automation too?", time: 'Mon 9:00 AM' },
      { from: 'seller', text: "Of course! I'll set up keyword triggers for your posts. Which keywords should trigger the DM?", time: 'Mon 9:15 AM' },
      { from: 'user', text: "Let's use 'INFO', 'PRICE', and 'LINK' as triggers.", time: 'Mon 9:20 AM' },
      { from: 'seller', text: "Done! All three keywords are live. I also added a welcome flow for new followers.", time: 'Mon 2:00 PM' },
      { from: 'seller', text: "Your Instagram DM funnel converted 47 leads this week! Here's the breakdown.", time: '3 hours ago' },
    ],
  },
  {
    sellerId: 8,
    lastMessage: "The Zapier integration is all set. Your BooSend triggers are now syncing with Airtable in real-time.",
    time: 'Yesterday',
    unread: false,
    messages: [
      { from: 'user', text: "Lisa, we need to connect our BooSend automations to Airtable and Google Sheets.", time: 'Sun 11:00 AM' },
      { from: 'seller', text: "No problem! I'll set up bi-directional sync. Should new contacts go to both, or just Airtable?", time: 'Sun 11:30 AM' },
      { from: 'user', text: "Both please. And we need a Zapier backup pipeline too.", time: 'Sun 11:45 AM' },
      { from: 'seller', text: "The Zapier integration is all set. Your BooSend triggers are now syncing with Airtable in real-time.", time: 'Yesterday' },
    ],
  },
  {
    sellerId: 6,
    lastMessage: "Cart recovery is bringing back about 22% of abandoned carts. Want me to optimize the messaging?",
    time: '2 days ago',
    unread: false,
    messages: [
      { from: 'user', text: "Nina, we just launched on Shopify and need abandoned cart recovery on WhatsApp ASAP.", time: 'Last week' },
      { from: 'seller', text: "I can have it running within 48 hours. I'll use the Standard package with the 3-step recovery sequence.", time: 'Last week' },
      { from: 'user', text: "Perfect, let's do it.", time: 'Last week' },
      { from: 'seller', text: "Cart recovery is bringing back about 22% of abandoned carts. Want me to optimize the messaging?", time: '2 days ago' },
    ],
  },
];
