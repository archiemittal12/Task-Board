# API Test Cases

## Common Setup

- Base URL: `http://localhost:3000`
- Auth header for protected APIs: `Authorization: Bearer <token>`
- Use these sample users:
- `adminUser`: project admin
- `memberUser`: normal project member
- `viewerUser`: project viewer
- `outsiderUser`: not part of the project
- Prepare one project with:
- `projectId`
- one board: `boardId`
- one column: `columnId`
- one story: `storyId`
- one task under the story: `taskId`

## Auth APIs

### `POST /auth/register`

- Register with valid `name`, `email`, `password`
  Expected: `201`, token returned, user object returned
- Register with missing `name`
  Expected: `400`
- Register with missing `email`
  Expected: `400`
- Register with missing `password`
  Expected: `400`
- Register with duplicate email
  Expected: `400`

### `POST /auth/login`

- Login with valid email and password
  Expected: `200`, token returned
- Login with wrong password
  Expected: `401`
- Login with unknown email
  Expected: `401`
- Login with missing email or password
  Expected: `400`

## User API

### `GET /users/me`

- Valid token
  Expected: `200`, logged-in user returned
- Missing token
  Expected: `401`
- Invalid token
  Expected: `401`

## Project APIs

### `POST /projects`

- Valid project creation
  Expected: `201`
- Missing name
  Expected: `400`
- Missing token
  Expected: `401`

### `GET /projects`

- Logged-in user with projects
  Expected: `200`, only joined projects returned
- Logged-in user with no projects
  Expected: `200`, empty array
- Missing token
  Expected: `401`

### `GET /projects/:id`

- Admin/member/viewer of project
  Expected: `200`
- Outsider user
  Expected: `403`
- Invalid project id
  Expected: `403` or `404` based on current service behavior

### `PUT /projects/:id`

- Admin updates name/description
  Expected: `200`
- Member tries update
  Expected: `403`
- Viewer tries update
  Expected: `403`
- Invalid project id
  Expected: `403` or `500` depending on current service behavior

### `DELETE /projects/:id`

- Admin deletes project with no dependent data
  Expected: `200`
- Member or viewer tries delete
  Expected: `403`
- Invalid project id
  Expected: `403` or `500` depending on current service behavior

## Board APIs

### `POST /projects/:projectId/boards`

- Admin creates board with valid name
  Expected: `201`
- Admin creates board with blank name
  Expected: `400`
- Non-admin member tries create
  Expected: `403`
- Viewer tries create
  Expected: `403`
- Outsider tries create
  Expected: `403`
- Duplicate board name in same project
  Expected: `400`
- Same board name in different project
  Expected: `201`

### `GET /projects/:projectId/boards`

- Admin/member/viewer fetch boards
  Expected: `200`
- Outsider fetches boards
  Expected: `403`
- Invalid project id
  Expected: `403` or `200` empty based on service/data state

### `PUT /projects/:projectId/boards/:boardId`

- Admin updates board name
  Expected: `200`
- Blank board name
  Expected: `400`
- Duplicate board name in same project
  Expected: `400`
- Member/viewer tries update
  Expected: `403`
- Invalid board id
  Expected: `404`

### `DELETE /projects/:projectId/boards/:boardId`

- Admin deletes empty board
  Expected: `200`
- Member/viewer tries delete
  Expected: `403`
- Invalid board id
  Expected: `404`
- Board with dependent data
  Expected: verify current behavior based on service rules

## Column APIs

### `POST /projects/:projectId/boards/:boardId/columns`

- Admin creates column with valid name
  Expected: `201`
- Blank name
  Expected: `400`
- Duplicate column name in same board with different casing
  Expected: `400`
- Member/viewer tries create
  Expected: `403`
- Invalid board id
  Expected: `404`
- Create column with `beforeColumnId`
  Expected: `201`, position inserted correctly
- Create column with `afterColumnId`
  Expected: `201`, position inserted correctly
- `beforeColumnId` from another board
  Expected: `400`

### `GET /projects/:projectId/boards/:boardId/columns`

- Admin/member/viewer fetch columns
  Expected: `200`
- Outsider fetches columns
  Expected: `403`
- Invalid board id
  Expected: `404`

### `PUT /projects/:projectId/boards/:boardId/columns/:columnId`

- Admin updates name
  Expected: `200`
- Admin updates `wipLimit`
  Expected: `200`
- Blank name
  Expected: `400`
- Duplicate column name in same board
  Expected: `400`
- Member/viewer tries update
  Expected: `403`
- Invalid column id
  Expected: `404`

### `DELETE /projects/:projectId/boards/:boardId/columns/:columnId`

- Admin deletes empty column
  Expected: `200`
- Delete column with tasks
  Expected: `400`
- Member/viewer tries delete
  Expected: `403`
- Invalid column id
  Expected: `404`

## Story APIs

### `POST /projects/:projectId/stories`

- Writer/admin creates story with valid `title` and `priority`
  Expected: `201`
- Missing title
  Expected: `400`
- Missing priority
  Expected: `400`
- Invalid priority
  Expected: `400`
- Invalid due date
  Expected: `400`
- Viewer tries create
  Expected: `403`
- Outsider tries create
  Expected: `403`
- Invalid project id
  Expected: `404`

### `GET /projects/:projectId/stories`

- Admin/member/viewer fetch stories
  Expected: `200`
- Outsider fetches stories
  Expected: `403`
- Invalid project id
  Expected: `403` or `200` empty depending on service behavior

### `PUT /projects/:projectId/stories/:storyId`

- Writer/admin updates story title
  Expected: `200`
- Writer/admin updates story description
  Expected: `200`
- Blank title
  Expected: `400`
- Invalid priority
  Expected: `400`
- Invalid due date
  Expected: `400`
- Viewer tries update
  Expected: `403`
- Invalid `storyId`
  Expected: `404`
- `storyId` points to non-story task
  Expected: `404`

## Task / Work Item APIs

### `POST /projects/:projectId/boards/:boardId/columns/:columnId/tasks`

- Writer/admin creates `TASK` under valid story
  Expected: `201`
- Writer/admin creates `BUG` under valid story
  Expected: `201`
- Missing title
  Expected: `400`
- Missing parent story
  Expected: `400`
- Parent id not found
  Expected: `404`
- Parent belongs to another project
  Expected: `400`
- Parent is not a story
  Expected: `400`
- Invalid type
  Expected: `400`
- Missing priority
  Expected: `400`
- Invalid priority
  Expected: `400`
- Invalid due date
  Expected: `400`
- Invalid assignee user id
  Expected: `400`
- Assignee not in project
  Expected: `400`
- Viewer tries create
  Expected: `403`
- Invalid column id
  Expected: `404`
- Column at WIP limit
  Expected: `400`

### `GET /projects/:projectId/boards/:boardId/columns/:columnId/tasks/:taskId`

- Admin/member/viewer fetch task
  Expected: `200`
- Outsider fetch task
  Expected: `403`
- Invalid task id
  Expected: `404`

### `PUT /projects/:projectId/boards/:boardId/columns/:columnId/tasks/:taskId`

- Writer/admin updates title only
  Expected: `200`
- Writer/admin updates description only
  Expected: `200`
- Writer/admin updates assignee to valid project member
  Expected: `200`
- Blank title
  Expected: `400`
- Invalid priority
  Expected: `400`
- Invalid due date
  Expected: `400`
- Invalid assignee
  Expected: `400`
- Assignee not in project
  Expected: `400`
- Viewer tries update
  Expected: `403`
- Try updating a story through task update API
  Expected: `400`

### `PATCH /projects/:projectId/boards/:boardId/columns/:columnId/tasks/:taskId/move`

- Move task within same column
  Expected: `200`
- Move task to another column in same project
  Expected: `200`
- Move with valid `beforeTaskId`
  Expected: `200`
- Move with valid `afterTaskId`
  Expected: `200`
- Move to column in another project
  Expected: `400`
- Invalid `beforeTaskId`
  Expected: `400`
- Invalid `afterTaskId`
  Expected: `400`
- Move story
  Expected: `400`
- Viewer tries move
  Expected: `403`
- Move into column at WIP limit
  Expected: `400`

### `DELETE /projects/:projectId/boards/:boardId/columns/:columnId/tasks/:taskId`

- Admin deletes normal task
  Expected: `200`
- Member/viewer tries delete
  Expected: `403`
- Invalid task id
  Expected: `404`
- Delete task that has child tasks
  Expected: verify children are also removed according to current service behavior
- Delete task with comments/audit logs
  Expected: verify current service behavior carefully

## Recommended Execution Order

- Register/login users
- Create project
- Create board
- Create columns
- Create story
- Create task/bug under story
- Move/update task
- Delete task
- Delete column
- Delete board
- Delete project

## Good Negative Test Group

- Missing token on every protected endpoint
- Invalid token on every protected endpoint
- Viewer trying write endpoints
- Outsider trying read/write endpoints
- Invalid ids for nested resources
- Cross-project ids mixed together
