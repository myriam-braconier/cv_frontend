"use client";

import { memo } from 'react';
import { Post } from '@/types/synth';
import Link from 'next/link';

interface PostListProps {
  posts: Post[];
}

const PostList = memo(function PostList({ posts }: PostListProps) {
  if (!posts?.length) return null;
  
  return (
    <div className="mt-4 space-y-4 divide-y divide-gray-200">
      {posts.map((post) => (
        <div key={post.id} className="pt-4">
          {post.titre && (
            <h3 className="font-semibold text-gray-900">
              {post.titre}
            </h3>
          )}
          {post.commentaire && (
            <p className="mt-1 text-gray-600 text-sm">
              {post.commentaire}
            </p>
          )}
          {post.url_contenu && (
            <Link
              href={post.url_contenu}
              className="mt-2 inline-flex items-center text-sm text-blue-500 hover:text-blue-700"
              target="_blank"
              rel="noopener noreferrer"
            >
              Voir le contenu
              <svg className="ml-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
              </svg>
            </Link>
          )}
          <span className="block mt-2 text-sm text-gray-500">
            Statut: {post.statut}
          </span>
        </div>
      ))}
    </div>
  );
});

PostList.displayName = 'PostList';

export { PostList };
