import { useWallet } from '@solana/wallet-adapter-react';

import React, { ReactElement } from 'react';
import { Layout } from '../components/Layout';

import { TweetList } from '../components/TweetList';
import { TweetForm } from '../components/TweetForm';
import { useTweets } from '../services/api';

export default function HomePage() {
  const { publicKey } = useWallet();

  const { data: list, status, fetchNextPage, hasNextPage, ref } = useTweets([]);

  return (
    <>
      <TweetForm />

      {publicKey && status === 'loading' && (
        <div className="p-8 text-center text-gray-500">Loading...</div>
      )}
      {publicKey && status === 'success' && (
        <TweetList
          ref={ref}
          hasMore={Boolean(hasNextPage)}
          onLoadMore={fetchNextPage}
          list={list}
          notFoundMessage="No tweets were found"
        />
      )}
    </>
  );
}

HomePage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
