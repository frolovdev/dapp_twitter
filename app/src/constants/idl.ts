export type Cryptotwitter = {
  "version": "0.1.0",
  "name": "cryptotwitter",
  "instructions": [
    {
      "name": "sendTweet",
      "accounts": [
        {
          "name": "author",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tweet",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "topic",
          "type": "string"
        },
        {
          "name": "content",
          "type": "string"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "tweet",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "author",
            "type": "publicKey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "topic",
            "type": "string"
          },
          {
            "name": "content",
            "type": "string"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "TopicTooLong",
      "msg": "The provided topic should be 50 characters long maximum."
    },
    {
      "code": 6001,
      "name": "ContentTooLong",
      "msg": "The provided content should be 280 characters long maximum."
    }
  ]
};

export const IDL: Cryptotwitter = {
  "version": "0.1.0",
  "name": "cryptotwitter",
  "instructions": [
    {
      "name": "sendTweet",
      "accounts": [
        {
          "name": "author",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tweet",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "topic",
          "type": "string"
        },
        {
          "name": "content",
          "type": "string"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "tweet",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "author",
            "type": "publicKey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "topic",
            "type": "string"
          },
          {
            "name": "content",
            "type": "string"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "TopicTooLong",
      "msg": "The provided topic should be 50 characters long maximum."
    },
    {
      "code": 6001,
      "name": "ContentTooLong",
      "msg": "The provided content should be 280 characters long maximum."
    }
  ]
};
