# Matching Game Back-End

This project is the back-end of the matching game. It is created with:
- Node.js
- Express
- TypeScript
- MongoDB
- Mongoose

This should be started before the `matching-game` project, although that can run without the server, it just won't do very much.

## Project Structure

`app.ts` is the main server file and root of the application.

`auth.ts` contains the code to generate and validate the JWTs used for authorization with bcrypt.

`types.ts` is where global TypeScript types are defined.

`/routes` contains the player and game related endpoints.

`/models` contains the player and game Mongoose definitions.

`/gateways` contains the database access methods for players and games.

`/types` contains an extension to the Express `Request` interface to define the auth token, if present.

## App usage

`npm start` will launch the app on `localhost:3100`.

The app expects JSON as the content type for requests with a body, and has CORS configured.