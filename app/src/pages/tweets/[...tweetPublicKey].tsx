import { PublicKey } from '@solana/web3.js';
import { useQueryClient } from '@tanstack/react-query';
import { NextPageContext } from 'next';
import { useRouter } from 'next/router';
import { ReactElement } from 'react';
import { toast } from 'react-hot-toast';
import { Layout } from '../../components/Layout';
import { TweetCard } from '../../components/TweetCard';
import { useTweetQuery } from '../../services/api';

export default function Tweet() {
  const router = useRouter();

  const publicKeyTweet = new PublicKey(
    router.query.tweetPublicKey?.[0] as string,
  );
  const { data, status } = useTweetQuery(publicKeyTweet);

  const queryClient = useQueryClient();

  async function handleSuccessUpdate() {
    await queryClient.invalidateQueries({
      queryKey: ['tweet', publicKeyTweet.toBase58()],
    });
    toast.success('Tweet updated!');
  }

  if (status !== 'success') {
    return <div className="p-8 text-center text-gray-500">Loading...</div>;
  }

  if (!data) {
    return <div className="p-8 text-center text-gray-500">Tweet not found</div>;
  }

  return (
    <TweetCard
      onSuccessUpdate={handleSuccessUpdate}
      tweet={{
        account: data,
        publicKey: publicKeyTweet,
      }}
    />
  );
}

Tweet.getInitialProps = async (context: NextPageContext) => {
  return {};
};

Tweet.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
