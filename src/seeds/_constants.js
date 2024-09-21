// * USERS
export const USERS_COUNT = 5000;

// * ECOMMERCE
export const CATEGORIES_COUNT = 25;
export const ADDRESSES_COUNT = 100;
export const COUPONS_COUNT = 15;
export const PRODUCTS_COUNT = 50;
export const PRODUCTS_SUB_IMAGES_COUNT = 4;
export const ORDERS_COUNT = 20;
export const ORDERS_RANDOM_ITEMS_COUNT = 20;

// * BLOG
export const POSTS_COUNT = 2000;
export const BLOG_CONTENT = [
  {
    id: "4e411ba2-6963-4419-873e-2ca1c48e4b3f",
    type: "heading",
    props: {
      textColor: "default",
      backgroundColor: "default",
      textAlignment: "left",
      level: 1,
    },
    content: [
      {
        type: "text",
        text: "ENVIRONMENT VARIABLES MANAGEMENT",
        styles: {},
      },
    ],
    children: [],
  },
  {
    id: "522c5e2b-5b08-429b-be28-6df20e41c451",
    type: "paragraph",
    props: {
      textColor: "default",
      backgroundColor: "default",
      textAlignment: "left",
    },
    content: [
      {
        type: "text",
        text: "Environment variables are special variables that can be set out of your Node.js applications, particularly useful to make your application configurable externally. Let’s say a cloud provider wants to change the listening port of your app or if you want to enable verbose logging without getting into the code.",
        styles: {},
      },
    ],
    children: [],
  },
  {
    id: "86f8b4cc-4a5d-48d5-a288-41f5681628cc",
    type: "heading",
    props: {
      textColor: "default",
      backgroundColor: "default",
      textAlignment: "left",
      level: 2,
    },
    content: [
      {
        type: "text",
        text: "CLI",
        styles: {
          bold: true,
        },
      },
    ],
    children: [],
  },
  {
    id: "76a327e6-b174-4bd4-a383-84f779906a63",
    type: "paragraph",
    props: {
      textColor: "default",
      backgroundColor: "default",
      textAlignment: "left",
    },
    content: [
      {
        type: "text",
        text: "Via CLI, the environment is ",
        styles: {},
      },
      {
        type: "text",
        text: "conservative",
        styles: {
          italic: true,
        },
      },
      {
        type: "text",
        text: " meaning that, when you will run different process management actions (restart, reload, stop/start), new environment variables will not be updated into your application.",
        styles: {},
      },
    ],
    children: [],
  },
  {
    id: "93bedff3-458b-4369-bfc6-de2b65b6f714",
    type: "heading",
    props: {
      textColor: "default",
      backgroundColor: "default",
      textAlignment: "left",
      level: 3,
    },
    content: [
      {
        type: "text",
        text: "Set environment",
        styles: {
          bold: true,
        },
      },
    ],
    children: [],
  },
  {
    id: "681d6dcc-9149-4449-b465-600d4477cd76",
    type: "paragraph",
    props: {
      textColor: "default",
      backgroundColor: "default",
      textAlignment: "left",
    },
    content: [
      {
        type: "text",
        text: "To set an environment variable via CLI:",
        styles: {},
      },
    ],
    children: [],
  },
  {
    id: "0108644c-774c-4567-ac15-76dc0b716a9a",
    type: "paragraph",
    props: {
      textColor: "default",
      backgroundColor: "default",
      textAlignment: "left",
    },
    content: [
      {
        type: "text",
        text: "$ ENV_VAR=value pm2 start app.js",
        styles: {
          code: true,
        },
      },
    ],
    children: [],
  },
  {
    id: "8a1f6e13-6ea2-4d03-b418-64995dcaa5e0",
    type: "heading",
    props: {
      textColor: "default",
      backgroundColor: "default",
      textAlignment: "left",
      level: 3,
    },
    content: [
      {
        type: "text",
        text: "Update environment",
        styles: {
          bold: true,
        },
      },
    ],
    children: [],
  },
  {
    id: "9dded279-a649-4793-a568-8c48fefead50",
    type: "paragraph",
    props: {
      textColor: "default",
      backgroundColor: "default",
      textAlignment: "left",
    },
    content: [
      {
        type: "text",
        text: "To update environment variables, you have to append the ",
        styles: {},
      },
      {
        type: "text",
        text: "--update-env",
        styles: {
          code: true,
        },
      },
      {
        type: "text",
        text: " to the restart/reload command:",
        styles: {},
      },
    ],
    children: [],
  },
  {
    id: "5af2f5d2-1f28-45dd-bc91-3ba448a3d499",
    type: "paragraph",
    props: {
      textColor: "default",
      backgroundColor: "default",
      textAlignment: "left",
    },
    content: [
      {
        type: "text",
        text: "$ ENV_VAR=somethingnew pm2 restart app --update-env",
        styles: {
          code: true,
        },
      },
    ],
    children: [],
  },
  {
    id: "2eadf982-fe36-4169-a101-ce9d5a5d1744",
    type: "heading",
    props: {
      textColor: "default",
      backgroundColor: "default",
      textAlignment: "left",
      level: 2,
    },
    content: [
      {
        type: "text",
        text: "Ecosystem process file",
        styles: {
          bold: true,
        },
      },
    ],
    children: [],
  },
  {
    id: "6d563a43-97b2-4835-86dd-f97f7be21b34",
    type: "paragraph",
    props: {
      textColor: "default",
      backgroundColor: "default",
      textAlignment: "left",
    },
    content: [
      {
        type: "text",
        text: "Any time you change the ecosystem process file, the environment variables will be updated.",
        styles: {},
      },
    ],
    children: [],
  },
  {
    id: "b8eaceee-aed5-41c7-b4a0-a97f063c051f",
    type: "heading",
    props: {
      textColor: "default",
      backgroundColor: "default",
      textAlignment: "left",
      level: 3,
    },
    content: [
      {
        type: "text",
        text: "Set Environment",
        styles: {
          bold: true,
        },
      },
    ],
    children: [],
  },
  {
    id: "95c35a66-94e4-4126-a663-c7946bbb217a",
    type: "paragraph",
    props: {
      textColor: "default",
      backgroundColor: "default",
      textAlignment: "left",
    },
    content: [
      {
        type: "text",
        text: "To set default environment variables via ecosystem file, you just need to declare them under the “env:” attribute:",
        styles: {},
      },
    ],
    children: [],
  },
  {
    id: "6d63bbe4-db56-4ccb-83fa-a5972a56a2b1",
    type: "paragraph",
    props: {
      textColor: "default",
      backgroundColor: "default",
      textAlignment: "left",
    },
    content: [
      {
        type: "text",
        text: 'module.exports = { apps: [{ name: "app", script: "./app.js", env: { NODE_ENV: "development" }, env_test: { NODE_ENV: "test", }, env_staging: { NODE_ENV: "staging", }, env_production: { NODE_ENV: "production", } }] }',
        styles: {
          code: true,
        },
      },
    ],
    children: [],
  },
  {
    id: "d6193bc6-599a-48a6-b63d-d12aed63c03f",
    type: "paragraph",
    props: {
      textColor: "default",
      backgroundColor: "default",
      textAlignment: "left",
    },
    content: [
      {
        type: "text",
        text: "Then start it:",
        styles: {},
      },
    ],
    children: [],
  },
  {
    id: "56a01747-46a3-42c9-a0f1-77a57c41918b",
    type: "paragraph",
    props: {
      textColor: "default",
      backgroundColor: "default",
      textAlignment: "left",
    },
    content: [
      {
        type: "text",
        text: "$ pm2 start ecosystem.config.js",
        styles: {
          code: true,
        },
      },
    ],
    children: [],
  },
  {
    id: "10d2ad4d-af4b-4de1-ac00-ecf8c3be2faa",
    type: "paragraph",
    props: {
      textColor: "default",
      backgroundColor: "default",
      textAlignment: "left",
    },
    content: [
      {
        type: "text",
        text: "As you might have noticed, there is also a part about the ",
        styles: {},
      },
      {
        type: "text",
        text: "env_test",
        styles: {
          code: true,
        },
      },
      {
        type: "text",
        text: ", ",
        styles: {},
      },
      {
        type: "text",
        text: "env_staging",
        styles: {
          code: true,
        },
      },
      {
        type: "text",
        text: " and ",
        styles: {},
      },
      {
        type: "text",
        text: "env_production",
        styles: {
          code: true,
        },
      },
      {
        type: "text",
        text: " in the ecosystem file.",
        styles: {},
      },
    ],
    children: [],
  },
  {
    id: "805e9862-3265-4581-9d7c-012a51ea4126",
    type: "paragraph",
    props: {
      textColor: "default",
      backgroundColor: "default",
      textAlignment: "left",
    },
    content: [
      {
        type: "text",
        text: "For example to use the ",
        styles: {},
      },
      {
        type: "text",
        text: "env_production",
        styles: {
          code: true,
        },
      },
      {
        type: "text",
        text: " variables instead of the default ones you just need to pass the ",
        styles: {},
      },
      {
        type: "text",
        text: "--env <env_name>",
        styles: {
          code: true,
        },
      },
      {
        type: "text",
        text: " option:",
        styles: {},
      },
    ],
    children: [],
  },
  {
    id: "490aad52-137a-4247-8daa-d48f815c59e2",
    type: "paragraph",
    props: {
      textColor: "default",
      backgroundColor: "default",
      textAlignment: "left",
    },
    content: [
      {
        type: "text",
        text: "$ pm2 start ecosystem.config.js --env production",
        styles: {
          code: true,
        },
      },
    ],
    children: [],
  },
  {
    id: "a58b3c61-97f6-4aa8-a335-20ea8a3d23ed",
    type: "paragraph",
    props: {
      textColor: "default",
      backgroundColor: "default",
      textAlignment: "left",
    },
    content: [
      {
        type: "text",
        text: "Note: The ",
        styles: {},
      },
      {
        type: "text",
        text: "env_production",
        styles: {
          code: true,
        },
      },
      {
        type: "text",
        text: " in the ecosystem file is a regex like ",
        styles: {},
      },
      {
        type: "text",
        text: "env_*",
        styles: {
          code: true,
        },
      },
      {
        type: "text",
        text: " that can have any value and be called when using the CLI via ",
        styles: {},
      },
      {
        type: "text",
        text: "-- env *",
        styles: {
          code: true,
        },
      },
      {
        type: "text",
        text: ".",
        styles: {},
      },
    ],
    children: [],
  },
  {
    id: "71114da7-5158-4bef-93c4-0a455ed18b70",
    type: "heading",
    props: {
      textColor: "default",
      backgroundColor: "default",
      textAlignment: "left",
      level: 3,
    },
    content: [
      {
        type: "text",
        text: "Update",
        styles: {
          bold: true,
        },
      },
    ],
    children: [],
  },
  {
    id: "9bd9c12c-5893-41f6-a4b9-6ee99ae1e14f",
    type: "paragraph",
    props: {
      textColor: "default",
      backgroundColor: "default",
      textAlignment: "left",
    },
    content: [
      {
        type: "text",
        text: "If you are using Ecosystem file to manage your application environment variables under the ",
        styles: {},
      },
      {
        type: "text",
        text: "env:",
        styles: {
          code: true,
        },
      },
      {
        type: "text",
        text: " attribute, the updated ones will always be updated on ",
        styles: {},
      },
      {
        type: "text",
        text: "pm2 <restart/reload> app",
        styles: {
          code: true,
        },
      },
      {
        type: "text",
        text: ".",
        styles: {},
      },
    ],
    children: [],
  },
  {
    id: "5b1211a2-1471-4cef-96b2-3e9e641256a0",
    type: "paragraph",
    props: {
      textColor: "default",
      backgroundColor: "default",
      textAlignment: "left",
    },
    content: [
      {
        type: "text",
        text: "$ pm2 restart/reload ecosystem.config.js [--env production]",
        styles: {
          code: true,
        },
      },
    ],
    children: [],
  },
  {
    id: "e7b50383-7d29-470c-ac96-8f5147591582",
    type: "heading",
    props: {
      textColor: "default",
      backgroundColor: "default",
      textAlignment: "left",
      level: 2,
    },
    content: [
      {
        type: "text",
        text: "Good practice: The NODE_ENV variable",
        styles: {
          bold: true,
        },
      },
    ],
    children: [],
  },
  {
    id: "63cdcbaa-8e17-4900-8505-015f35561ec7",
    type: "paragraph",
    props: {
      textColor: "default",
      backgroundColor: "default",
      textAlignment: "left",
    },
    content: [
      {
        type: "text",
        text: "A common convention in Node.js is that the NODE_ENV environment variable specifies the environment in which an application is running (usually, development or production).",
        styles: {},
      },
    ],
    children: [],
  },
  {
    id: "c99020ed-7e09-46d8-b0ea-42de85eaa0ee",
    type: "paragraph",
    props: {
      textColor: "default",
      backgroundColor: "default",
      textAlignment: "left",
    },
    content: [
      {
        type: "text",
        text: "For example, with express, setting NODE_ENV to “production” can improve performance by a factor of 3 according to the ",
        styles: {},
      },
      {
        type: "link",
        href: "https://expressjs.com/docs/advanced/best-practice-performance.html#set-node_env-to-production",
        content: [
          {
            type: "text",
            text: "documentation",
            styles: {
              bold: true,
            },
          },
        ],
      },
      {
        type: "text",
        text: ". This enables:",
        styles: {},
      },
    ],
    children: [],
  },
  {
    id: "c84f4faf-ab26-4b57-a76e-658a35f769d8",
    type: "bulletListItem",
    props: {
      textColor: "default",
      backgroundColor: "default",
      textAlignment: "left",
    },
    content: [
      {
        type: "text",
        text: "Cache for view templates.",
        styles: {},
      },
    ],
    children: [],
  },
  {
    id: "8786ff36-6548-4600-a662-5fa8fcb385d2",
    type: "bulletListItem",
    props: {
      textColor: "default",
      backgroundColor: "default",
      textAlignment: "left",
    },
    content: [
      {
        type: "text",
        text: "Cache for CSS files generated from CSS extensions.",
        styles: {},
      },
    ],
    children: [],
  },
  {
    id: "e4a1fd7b-3e1b-49c6-87bd-2b7b97514d5f",
    type: "bulletListItem",
    props: {
      textColor: "default",
      backgroundColor: "default",
      textAlignment: "left",
    },
    content: [
      {
        type: "text",
        text: "Generate less verbose error messages.",
        styles: {},
      },
    ],
    children: [],
  },
  {
    id: "8b884a67-dc97-4120-ae28-7b38df17f2f3",
    type: "paragraph",
    props: {
      textColor: "default",
      backgroundColor: "default",
      textAlignment: "left",
    },
    content: [],
    children: [],
  },
];
export const COMMENT_COUNT = 5000;
