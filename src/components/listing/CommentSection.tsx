'use client';

import { useState, useTransition } from 'react';
import { postGigCommentAction } from '@/lib/marketplace/actions';
import type { GigComment } from '@/types';

interface CommentSectionProps {
  gigId: number;
  comments: GigComment[];
  viewerAccountId: string | null;
}

function CommentItem({
  comment,
  gigId,
  viewerAccountId,
  onReplyPosted,
}: {
  comment: GigComment;
  gigId: number;
  viewerAccountId: string | null;
  onReplyPosted: () => void;
}) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isPending, startTransition] = useTransition();

  function handleReply() {
    if (!replyText.trim()) return;
    startTransition(async () => {
      const result = await postGigCommentAction({
        gigId,
        parentCommentId: comment.id,
        body: replyText.trim(),
      });
      if (result.success) {
        setReplyText('');
        setShowReplyForm(false);
        onReplyPosted();
      }
    });
  }

  return (
    <div className="comment-item">
      <div className="comment-header">
        <div
          className="comment-avatar"
          style={{ backgroundColor: comment.authorAvatarColor }}
        >
          {comment.authorAvatar}
        </div>
        <div className="comment-meta">
          <span className="comment-author">
            {comment.authorName}
            {comment.isGigOwner && (
              <span className="comment-seller-badge">Seller</span>
            )}
            {comment.isVerifiedBuyer && !comment.isGigOwner && (
              <span className="comment-verified-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="12" height="12"><path d="M5 12l5 5L20 7" /></svg>
                Verified Buyer
              </span>
            )}
          </span>
          <span className="comment-time">{comment.createdAt}</span>
        </div>
      </div>
      <div className="comment-body">{comment.body}</div>
      {viewerAccountId && (
        <button
          className="comment-reply-btn"
          onClick={() => setShowReplyForm(!showReplyForm)}
        >
          {showReplyForm ? 'Cancel' : 'Reply'}
        </button>
      )}

      {showReplyForm && (
        <div className="comment-reply-form">
          <textarea
            className="comment-input"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write a reply..."
            rows={2}
          />
          <button
            className="comment-submit-btn"
            onClick={handleReply}
            disabled={isPending || !replyText.trim()}
          >
            {isPending ? 'Posting...' : 'Reply'}
          </button>
        </div>
      )}

      {comment.replies.length > 0 && (
        <div className="comment-replies">
          {comment.replies.map((reply) => (
            <div key={reply.id} className="comment-item comment-reply">
              <div className="comment-header">
                <div
                  className="comment-avatar"
                  style={{ backgroundColor: reply.authorAvatarColor }}
                >
                  {reply.authorAvatar}
                </div>
                <div className="comment-meta">
                  <span className="comment-author">
                    {reply.authorName}
                    {reply.isGigOwner && (
                      <span className="comment-seller-badge">Seller</span>
                    )}
                    {reply.isVerifiedBuyer && !reply.isGigOwner && (
                      <span className="comment-verified-badge">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="12" height="12"><path d="M5 12l5 5L20 7" /></svg>
                        Verified Buyer
                      </span>
                    )}
                  </span>
                  <span className="comment-time">{reply.createdAt}</span>
                </div>
              </div>
              <div className="comment-body">{reply.body}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function CommentSection({
  gigId,
  comments: initialComments,
  viewerAccountId,
}: CommentSectionProps) {
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState('');
  const [isPending, startTransition] = useTransition();
  const [refreshKey, setRefreshKey] = useState(0);

  function handlePost() {
    if (!newComment.trim()) return;
    startTransition(async () => {
      const result = await postGigCommentAction({
        gigId,
        parentCommentId: null,
        body: newComment.trim(),
      });
      if (result.success) {
        setNewComment('');
        setRefreshKey((k) => k + 1);
        // Optimistic: add to local state
        const optimistic: GigComment = {
          id: Date.now(),
          gigId,
          accountId: viewerAccountId ?? '',
          parentCommentId: null,
          authorName: 'You',
          authorAvatar: 'U',
          authorAvatarColor: '#475569',
          isGigOwner: false,
          isVerifiedBuyer: false,
          body: newComment.trim(),
          createdAt: 'Just now',
          replies: [],
        };
        setComments((prev) => [...prev, optimistic]);
      }
    });
  }

  return (
    <div className="comment-section" key={refreshKey}>
      <h3 className="comment-section-title">
        Comments
        <span className="comment-count">{comments.length}</span>
      </h3>

      {viewerAccountId ? (
        <div className="comment-form">
          <textarea
            className="comment-input"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Ask a question or leave a comment..."
            rows={3}
          />
          <button
            className="comment-submit-btn"
            onClick={handlePost}
            disabled={isPending || !newComment.trim()}
          >
            {isPending ? 'Posting...' : 'Post Comment'}
          </button>
        </div>
      ) : (
        <p className="comment-signin-prompt">
          Sign in to leave a comment.
        </p>
      )}

      <div className="comment-list">
        {comments.length === 0 && (
          <p className="comment-empty">No comments yet. Be the first to ask a question!</p>
        )}
        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            gigId={gigId}
            viewerAccountId={viewerAccountId}
            onReplyPosted={() => setRefreshKey((k) => k + 1)}
          />
        ))}
      </div>
    </div>
  );
}
