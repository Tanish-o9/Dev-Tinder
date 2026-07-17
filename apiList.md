# DevTinder APIS

## Platform additions

### Chat

- GET /chat/:connectionId
- POST /chat/:connectionId

### Developer discovery

- GET /feed?page=1&limit=10 (includes match score and explanation)
- GET /developers/saved
- POST /developers/:userId/save
- DELETE /developers/:userId/save
- POST /developers/:userId/block
- POST /developers/:userId/report
- GET /github/:username

### Project collaboration

- GET /projects
- POST /projects
- GET /projects/mine
- GET /projects/:projectId
- POST /projects/:projectId/apply
- GET /projects/:projectId/applications
- PATCH /projects/:projectId/applications/:applicationId

### Notifications

- GET /notifications
- PATCH /notifications/read

## authRouter

- POST/signup
- POST/login
- POST /logout

## profileRouter

- GET /profile/view
- PATCH /profile/edit
- PATCH /profile/editPassword

## connectionRequestRouter

- POST/request/send/interested/:userId
- POST/request/send/ignored/:userId
- POST/request/review/accepted/:requestId
- POST /request/review/rejected/:requestId

## userRouter

- GET /user/requests/received
- GET/user/connections
- GET /feed - Gets profiles of other users on the platform

# Status: ignored, interested, accepeted, rejected
