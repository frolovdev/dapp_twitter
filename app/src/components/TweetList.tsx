import { ProgramAccount } from '@project-serum/anchor';
import { InfiniteData } from '@tanstack/react-query';
import React from 'react';
import { TweetAccount } from '../services/api';
import { TweetCard } from './TweetCard';

export const TweetList = React.forwardRef<
  HTMLButtonElement,
  {
    list: InfiniteData<ProgramAccount<TweetAccount>[]>;
    notFoundMessage: string;
    hasMore: Boolean;
    onLoadMore: any;
  }
>(({ list, notFoundMessage, hasMore, onLoadMore }, ref) => {
  if (list.pages.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">{notFoundMessage}</div>
    );
  }

  return (
    <>
      {list.pages.map((group) =>
        group.map((tweet) => (
          <TweetCard
            key={tweet.account.timestamp.toString()}
            tweet={tweet}
          />
        )),
      )}

      {hasMore && (
        <div className="p-8 text-center">
          <button
            ref={ref}
            onClick={onLoadMore}
            className="rounded-full border bg-gray-50 px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          >
            Load more
          </button>
        </div>
      )}
    </>
  );
});

TweetList.displayName = 'TweetList';
