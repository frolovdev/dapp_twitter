import { useWallet } from '@solana/wallet-adapter-react';

import { ReactElement } from 'react';
import { Layout } from '../components/Layout';

import { TweetList } from '../components/TweetList';
import { TweetForm } from '../components/TweetForm';
import { authorFilter, useTweets } from '../services/api';

export default function HomePage() {
  const { publicKey } = useWallet();
  const { data: list, status } = useTweets([]);

  return (
    <>
      <TweetForm></TweetForm>

      {publicKey && status === 'loading' && (
        <div className="p-8 text-center text-gray-500">Loading...</div>
      )}
      {publicKey && status === 'success' && (
        <TweetList
          list={list}
          notFoundMessage="No tweets were found"
        ></TweetList>
      )}
    </>
  );
}

HomePage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
