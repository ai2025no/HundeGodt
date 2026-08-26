'use client';

import React, { useState, useEffect } from 'react';
import { Star, CheckCircle2, XCircle, MessageSquare, Reply, Trash2 } from 'lucide-react';
import { db } from '@/lib/db';
import { Review } from '@/types';
import { formatDateTimeNorwegian } from '@/lib/utils';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const loadData = () => {
    setReviews(db.getReviews());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('hg_storage_updated', loadData);
    return () => window.removeEventListener('hg_storage_updated', loadData);
  }, []);

  const handleApprove = (id: string) => {
    db.updateReviewStatus(id, 'approved');
    loadData();
  };

  const handleReject = (id: string) => {
    db.updateReviewStatus(id, 'rejected');
    loadData();
  };

  const handleSaveReply = (id: string) => {
    db.updateReviewStatus(id, 'approved', replyText);
    setReplyingReviewId(null);
    setReplyText('');
    loadData();
  };

  return (
    <div className="space-y-6">
      
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Omtaler & Moderering ({reviews.length})</h1>
        <p className="text-xs text-slate-400 mt-1">
          Godkjenn kundeanmeldelser, svar på tilbakemeldinger og overvåk gjennomsnittlig rating.
        </p>
      </div>

      <div className="space-y-4">
        {reviews.map((rev) => (
          <div
            key={rev.id}
            className="bg-slate-950/80 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center text-amber-400">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <span className="font-bold text-white text-sm">{rev.title}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    rev.status === 'approved' ? 'bg-forest-900 text-forest-300' : 'bg-amber-900 text-amber-300'
                  }`}>
                    {rev.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Av <strong>{rev.customerName}</strong> for produktet <strong className="text-white">{rev.productName}</strong>
                </p>
              </div>

              <span className="text-xs text-slate-500">{formatDateTimeNorwegian(rev.createdAt)}</span>
            </div>

            <p className="text-xs text-slate-300 italic bg-slate-900 p-4 rounded-2xl border border-slate-800 leading-relaxed">
              «{rev.comment}»
            </p>

            {rev.adminResponse && (
              <div className="p-3 bg-forest-950/80 border border-forest-800 rounded-xl text-xs text-forest-200">
                <strong>Offentlig svar fra Hundegodt:</strong> {rev.adminResponse}
              </div>
            )}

            {replyingReviewId === rev.id && (
              <div className="space-y-2 p-3 bg-slate-900 rounded-xl border border-slate-700">
                <label className="text-xs font-bold text-white">Ditt svar til kunden:</label>
                <textarea
                  rows={2}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Takk for din omtale!..."
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleSaveReply(rev.id)}
                    className="px-3 py-1.5 bg-forest-700 text-white font-bold text-xs rounded-lg"
                  >
                    Publiser svar
                  </button>
                  <button
                    type="button"
                    onClick={() => setReplyingReviewId(null)}
                    className="px-3 py-1.5 bg-slate-800 text-slate-400 text-xs rounded-lg"
                  >
                    Avbryt
                  </button>
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setReplyingReviewId(rev.id);
                  setReplyText(rev.adminResponse || '');
                }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
              >
                <Reply className="w-3.5 h-3.5" />
                <span>Svar kunde</span>
              </button>

              {rev.status !== 'approved' && (
                <button
                  type="button"
                  onClick={() => handleApprove(rev.id)}
                  className="px-3 py-1.5 bg-forest-700 hover:bg-forest-600 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Godkjenn</span>
                </button>
              )}

              {rev.status !== 'rejected' && (
                <button
                  type="button"
                  onClick={() => handleReject(rev.id)}
                  className="px-3 py-1.5 bg-red-950 hover:bg-red-900 text-red-300 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Avvis</span>
                </button>
              )}
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
