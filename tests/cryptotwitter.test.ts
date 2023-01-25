import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { bs58 } from '@project-serum/anchor/dist/cjs/utils/bytes';
import { Cryptotwitter } from '../target/types/cryptotwitter';

describe('cryptotwitter', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Cryptotwitter as Program<Cryptotwitter>;

  const sendTweet = async (
    author: anchor.Address,
    topic: string,
    content: string,
  ) => {
    const tweet = anchor.web3.Keypair.generate();
    await program.methods
      .sendTweet(topic, content)
      .accounts({
        tweet: tweet.publicKey,
        author,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([tweet])
      .rpc();

    return tweet;
  };

  it('Sent tweet', async () => {
    const tweet = anchor.web3.Keypair.generate();
    const topic = 'My head';
    const content = 'My super content';

    await program.methods
      .sendTweet(topic, content)
      .accounts({
        tweet: tweet.publicKey,
        author: program.provider.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([tweet])
      .rpc();
    const tweetAccount = await program.account.tweet.fetch(tweet.publicKey);

    expect(tweetAccount.content).toEqual(content);
    expect(tweetAccount.topic).toEqual(topic);
    expect(tweetAccount.author.toBase58()).toEqual(
      program.provider.publicKey.toBase58(),
    );
    expect(tweetAccount.timestamp).toBeDefined();
  });

  it('sent tweet another signer', async () => {
    const my_account = anchor.web3.Keypair.generate();

    const signature = await provider.connection.requestAirdrop(
      my_account.publicKey,
      10000000000,
    );
    const latestBlockHash = await provider.connection.getLatestBlockhash();
    await program.provider.connection.confirmTransaction({
      signature,
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
    });

    const tweet = anchor.web3.Keypair.generate();
    const topic = 'my_topic';
    const content = 'My super content';

    await program.methods
      .sendTweet(topic, content)
      .accounts({
        tweet: tweet.publicKey,
        author: my_account.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([tweet, my_account])
      .rpc();
    const tweetAccount = await program.account.tweet.fetch(tweet.publicKey);

    expect(tweetAccount.content).toEqual(content);
    expect(tweetAccount.topic).toEqual(topic);
    expect(tweetAccount.author.toBase58()).toEqual(
      my_account.publicKey.toBase58(),
    );
    expect(tweetAccount.timestamp).toBeDefined();
  });

  it('cannot provide a topic with more than 50 characters', async () => {
    const tweet = anchor.web3.Keypair.generate();
    const topicWith51Chars = 'x'.repeat(51);
    const promise = program.methods
      .sendTweet(topicWith51Chars, 'Hummus, am I right?')
      .accounts({
        tweet: tweet.publicKey,
        author: program.provider.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([tweet])
      .rpc();

    await expect(promise).rejects.toThrow(/TopicTooLong./);
  });

  it('cannot provide a content with more than 280 characters', async () => {
    const tweet = anchor.web3.Keypair.generate();
    const contentWith281Chars = 'x'.repeat(281);

    const promise = program.methods
      .sendTweet('my_topic', contentWith281Chars)
      .accounts({
        tweet: tweet.publicKey,
        author: program.provider.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([tweet])
      .rpc();
    await expect(promise).rejects.toThrow(/ContentTooLong./);
  });

  it('can fetch all tweets', async () => {
    const tweetAccounts = await program.account.tweet.all();
    expect(tweetAccounts).toHaveLength(2);
  });

  it('can fetch authors tweets', async () => {
    const authorPublicKey = program.provider.publicKey;
    const tweetAccounts = await program.account.tweet.all([
      {
        memcmp: {
          offset: 8,
          bytes: authorPublicKey.toBase58(),
        },
      },
    ]);

    expect(tweetAccounts.length).toEqual(1);
    expect(
      tweetAccounts.every(
        (tweetAccount) =>
          tweetAccount.account.author.toBase58() === authorPublicKey.toBase58(),
      ),
    ).toBeTruthy();
  });

  it('can fetch tweets by topic', async () => {
    const tweetAccounts = await program.account.tweet.all([
      {
        memcmp: {
          offset:
            8 + // Discriminator.
            32 + // Author public key.
            8 + // Timestamp.
            4, // Topic string prefix.
          bytes: bs58.encode(Buffer.from('my_topic')),
        },
      },
    ]);

    expect(tweetAccounts.length).toEqual(1);
  });

  it('can update a tweet', async () => {
    // Send a tweet and fetch its account.
    const author = program.provider.publicKey;
    const tweet = await sendTweet(author, 'web2', 'Hello World!');
    const tweetAccount = await program.account.tweet.fetch(tweet.publicKey);

    // Ensure it has the right data.
    expect(tweetAccount.topic).toEqual('web2');
    expect(tweetAccount.content).toEqual('Hello World!');

    // Update the Tweet.
    await program.methods
      .updateTweet('solana', 'gm everyone!')
      .accounts({
        tweet: tweet.publicKey,
        author,
      })
      .rpc();

    // Ensure the updated tweet has the updated data.
    const updatedTweetAccount = await program.account.tweet.fetch(
      tweet.publicKey,
    );
    expect(updatedTweetAccount.topic).toEqual('solana');
    expect(updatedTweetAccount.content).toEqual('gm everyone!');
  });

  it("cannot update someone else's tweet", async () => {
    // Send a tweet.
    const author = program.provider.publicKey;
    const tweet = await sendTweet(author, 'solana', 'Solana is awesome!');

    // Update the Tweet.

    const promise = program.methods
      .updateTweet('eth', 'Ethereum is awesome!')
      .accounts({
        tweet: tweet.publicKey,
        author: anchor.web3.Keypair.generate().publicKey,
      })
      .rpc();
    await expect(promise).rejects.toThrow(/Signature verification failed/);

    // Ensure the tweet account kept the initial data.
    const tweetAccount = await program.account.tweet.fetch(tweet.publicKey);
    expect(tweetAccount.topic).toEqual('solana');
    expect(tweetAccount.content).toEqual('Solana is awesome!');
  });

  it('can delete a tweet', async () => {
    // Create a new tweet.
    const author = program.provider.publicKey;
    const tweet = await sendTweet(author, 'solana', 'gm');

    // Delete the Tweet.
    await program.methods
      .deleteTweet()
      .accounts({
        tweet: tweet.publicKey,
        author,
      })
      .rpc();

    // Ensure fetching the tweet account returns null.
    const tweetAccount = await program.account.tweet.fetchNullable(
      tweet.publicKey,
    );
    expect(tweetAccount).toBeNull();
  });

  it("cannot delete someone else's tweet", async () => {
    // Create a new tweet.
    const author = program.provider.publicKey;
    const tweet = await sendTweet(author, 'solana', 'gm');

    // Try to delete the Tweet from a different author.

    const promise = program.methods
      .deleteTweet()
      .accounts({
        tweet: tweet.publicKey,
        author: anchor.web3.Keypair.generate().publicKey,
      })
      .rpc();
    await expect(promise).rejects.toThrow(/Signature verification failed/);

    // Ensure the tweet account still exists with the right data.
    const tweetAccount = await program.account.tweet.fetch(tweet.publicKey);
    expect(tweetAccount.topic).toEqual('solana');
    expect(tweetAccount.content).toEqual('gm');
  });
});
