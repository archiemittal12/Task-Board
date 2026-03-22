import axios from "axios";

// Create an Axios instance
const apiClient = axios.create({
  baseURL: "http://localhost:3000", // Adjust this if your backend runs on a different port
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Add a request interceptor to attach the JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiration (optional but recommended)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token is invalid/expired. Clear storage and redirect to login
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default apiClient;

export const fetchBoardColumns = async (projectId: string, boardId: string) => {
  return apiClient.get(`/projects/${projectId}/boards/${boardId}/columns`);
};

export const fetchProjectStories = async (projectId: string) => {
  return apiClient.get(`/projects/${projectId}/stories`);
};

export const createStory = async (projectId: string, storyData: any) => {
  return apiClient.post(`/projects/${projectId}/stories`, storyData);
};

export const createWorkItem = async (columnId: string, taskData: any) => {
  return apiClient.post(`/columns/${columnId}/tasks`, taskData);
};

export const deleteTask = async (taskId: string) => {
  return apiClient.delete(`/tasks/${taskId}`);
};
