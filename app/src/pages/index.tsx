import { useWallet } from '@solana/wallet-adapter-react';

import dynamic from 'next/dynamic';
import { ReactElement, useEffect } from 'react';
import { Layout } from '../components/Layout';

import { TweetList } from '../components/TweetList';
import { TweetForm } from '../components/TweetForm';

export default function HomePage() {
  return (
    <>
      <TweetForm></TweetForm>

      <TweetList notFoundMessage="No tweets were found"></TweetList>
    </>
  );
}

HomePage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
