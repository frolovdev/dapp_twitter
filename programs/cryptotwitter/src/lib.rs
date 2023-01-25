use anchor_lang::prelude::*;

pub mod constants;
pub mod errors;
use constants::*;
use errors::*;


declare_id!("CBTZC1uPViBPwAqAxJR2ZfUFM9FNoVT8fLUH1TQ8wzXt");

#[program]
pub mod cryptotwitter {
    use super::*;

    pub fn send_tweet(ctx: Context<SendTweet>, topic: String, content: String) -> Result<()> {
        let tweet = &mut ctx.accounts.tweet;
        let clock = Clock::get().unwrap();

        if topic.chars().count() > 50 {
            return Err(DomainErrorCode::TopicTooLong.into());
        }

        if content.chars().count() > 280 {
            return Err(DomainErrorCode::ContentTooLong.into());
        }

        tweet.author = ctx.accounts.author.key();
        tweet.timestamp = clock.unix_timestamp;
        tweet.topic = topic;
        tweet.content = content;

        Ok(())
    }

    pub fn update_tweet(ctx: Context<UpdateTweet>, topic: String, content: String) -> Result<()> {
        let tweet: &mut Account<Tweet> = &mut ctx.accounts.tweet;

        if topic.chars().count() > 50 {
            return Err(DomainErrorCode::TopicTooLong.into())
        }

        if content.chars().count() > 280 {
            return Err(DomainErrorCode::ContentTooLong.into())
        }

        tweet.topic = topic;
        tweet.content = content;

        Ok(())
    }


    pub fn delete_tweet(_ctx: Context<DeleteTweet>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct UpdateTweet<'info> {
    #[account(mut, has_one = author)]
    pub tweet: Account<'info, Tweet>,
    pub author: Signer<'info>,
}

#[derive(Accounts)]
pub struct DeleteTweet<'info> {
    #[account(mut, has_one = author, close = author)]
    pub tweet: Account<'info, Tweet>,
    pub author: Signer<'info>,
}

#[derive(Accounts)]
pub struct Initialize {}

#[account]
pub struct Tweet {
    pub author: Pubkey,
    pub timestamp: i64,
    pub topic: String,
    pub content: String,
}

impl Tweet {
    const LEN: usize = DISCRIMINATOR_LENGTH
        + PUBLIC_KEY_LENGTH // Author.
        + TIMESTAMP_LENGTH // Timestamp.
        + STRING_LENGTH_PREFIX + MAX_TOPIC_LENGTH // Topic.
        + STRING_LENGTH_PREFIX + MAX_CONTENT_LENGTH; // Content.
}

#[derive(Accounts)]
pub struct SendTweet<'info> {
    
    #[account(mut)]
    pub author: Signer<'info>,

    #[account(init, payer = author, space = Tweet::LEN)]
    pub tweet: Account<'info, Tweet>,
    pub system_program: Program<'info, System>,
}
