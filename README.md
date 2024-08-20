## Gemini Clone
A clone chat bot interface using Gemini API that stores user prompts on Local Storage. Given the many states involved, this project manages them using React function reducers. 

Project deployed on Vercel. 

# Cloning & Navigation
1. Run `npm install` to install necessary dependencies.
2. Serve localhost with `npm run dev`.
   
- Codebase resides main in the src folder where `src/components` stores the React components. 
- Context file resides in `src/context` where most of the state logic is done.
- `src/utils` contains the formatting code block to keep the context file clean.

# Future Implementation
Some features that could be improved given more time would be the following:

1. Continuous conversational threads.
2. NLTP for chat naming based on user prompt similar to ChatGPT's chat naming.
3. Faux userbase to allow logins and logouts.
4. Dark and light mode options.

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh
