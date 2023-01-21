import { PublicKey } from '@solana/web3.js';
import { NextPageContext } from 'next';
import { useRouter } from 'next/router';
import { ReactElement } from 'react';
import { Layout } from '../../components/Layout';
import { TweetCard } from '../../components/TweetCard';
import { useTweetQuery } from '../../services/api';

export default function Tweet() {
  const router = useRouter();

  const { data, status } = useTweetQuery(
    new PublicKey(router.query.tweetPublicKey?.[0] as string),
  );

  if (status !== 'success') {
    return <div className="p-8 text-center text-gray-500">Loading...</div>;
  }

  if (!data) {
    return <div className="p-8 text-center text-gray-500">Tweet not found</div>;
  }

  return (
    <TweetCard
      publicKey={router.query.tweetPublicKey as string}
      author={data.author.toBase58()}
      topic={data.topic}
      content={data.content}
      timestamp={data.timestamp.toNumber()}
    />
  );
}

Tweet.getInitialProps = async (context: NextPageContext) => {
  return {};
};

Tweet.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
