const SERVER_URL = 'http://172.30.246.151:2506'; 

export const fetchCourses = async () => {
  const response = await fetch(`${SERVER_URL}/courses`);
  if (!response.ok) throw new Error('Failed to fetch courses');
  return response.json();
};

export const fetchCourseById = async (id: number) => {
  const response = await fetch(`${SERVER_URL}/course/${id}`);
  if (!response.ok) throw new Error(`Failed to fetch course with id ${id}`);
  return response.json();
};

export const addCourse = async (course: {
  name: string;
  instructor: string;
  description: string;
  status: string;
  students: number;
  duration: number;
}) => {
  const response = await fetch(`${SERVER_URL}/course`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(course),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Failed to add course');
  }
  return response.json();
};

export const deleteCourse = async (id: number) => {
  const response = await fetch(`${SERVER_URL}/course/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Failed to delete course');
  }
  return response.json();
};

export const fetchAllCourses = async () => {
  const response = await fetch(`${SERVER_URL}/allCourses`);
  if (!response.ok) throw new Error('Failed to fetch all courses');
  return response.json();
};
