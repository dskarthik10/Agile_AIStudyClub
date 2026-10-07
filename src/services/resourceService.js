import { fetchAuthSession } from 'aws-amplify/auth';

const API_URL =
  'https://vaja7mf7u4.execute-api.ap-south-1.amazonaws.com';

<<<<<<< HEAD
async function getToken() {
  const { tokens } = await fetchAuthSession();

  if (!tokens?.idToken) {
    throw new Error('User is not authenticated');
  }

  return tokens.idToken.toString();
}

async function apiRequest(endpoint, options = {}) {
  const token = await getToken();

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    let message = `API request failed: ${response.status}`;

    try {
      const error = await response.json();
      message = error.error || error.message || message;
    } catch (_) {}

    throw new Error(message);
  }

  return response.json();
}

export const resourceService = {

  // =========================================================
  // RESOURCES
  // =========================================================

  async getResources(filters = {}) {
    try {
      const data = await apiRequest('/resources', {
        method: 'GET',
      });

=======
export const resourceService = {
  async getResources(filters = {}) {
    try {
      // Get the current Cognito access token
      const { tokens } = await fetchAuthSession();

      if (!tokens?.accessToken) {
        throw new Error('User is not authenticated');
      }

      const idToken = tokens.idToken.toString();

      // Call API Gateway
      const response = await fetch(`${API_URL}/resources`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();

      // Convert DynamoDB items into UI format
>>>>>>> 458ece2229f06c188c2a98f253153a6a2869956b
      let resources = (Array.isArray(data) ? data : []).map(item => ({
        id: item.PK?.replace('RESOURCE#', ''),
        title: item.title || 'Untitled Resource',
        subject: item.subject || 'General',
        description: item.description || '',
        type: item.type || 'Notes',
        semester: item.semester || '',
        uploadedBy: item.uploadedBy || 'Unknown',
        uploadDate: item.uploadDate || '',
        downloads: item.downloads || 0,
        likes: item.likes || 0,
        fileSize: item.fileSize || 'N/A',
        s3Key: item.s3Key || '',
      }));

<<<<<<< HEAD
=======
      // Client-side filtering
>>>>>>> 458ece2229f06c188c2a98f253153a6a2869956b
      if (filters.subject && filters.subject !== 'All Subjects') {
        resources = resources.filter(
          r => r.subject === filters.subject
        );
      }

      if (filters.type && filters.type !== 'All Types') {
        resources = resources.filter(
          r => r.type === filters.type
        );
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();

        resources = resources.filter(r =>
          r.title.toLowerCase().includes(searchLower) ||
          r.description.toLowerCase().includes(searchLower) ||
          r.subject.toLowerCase().includes(searchLower)
        );
      }

      return resources;
<<<<<<< HEAD
    } catch (error) {
      console.error('Error loading resources:', error);
=======

    } catch (error) {
      console.error('Error loading resources from AWS:', error);
>>>>>>> 458ece2229f06c188c2a98f253153a6a2869956b
      throw error;
    }
  },

  async getResourceById(id) {
<<<<<<< HEAD
    const resources = await this.getResources();

    return resources.find(resource => resource.id === id) || null;
  },

  async searchResources(query) {
    return this.getResources({
      search: query,
    });
=======
    throw new Error('Resource details API not implemented yet');
  },

  async searchResources(query) {
    const resources = await this.getResources({
      search: query,
    });

    return resources;
>>>>>>> 458ece2229f06c188c2a98f253153a6a2869956b
  },

  async saveResource(id) {
    return {
      success: true,
      message: 'Resource saved successfully',
    };
  },

  async uploadResource(resourceData) {
<<<<<<< HEAD
    const token = await getToken();

    const file = resourceData.file;

    // 1. Get S3 upload URL
=======
    const { tokens } = await fetchAuthSession();

    if (!tokens?.idToken) {
      throw new Error('User is not authenticated');
    }

    const file = resourceData.file;
    const token = tokens.idToken.toString();

    // 1. Get S3 pre-signed URL
>>>>>>> 458ece2229f06c188c2a98f253153a6a2869956b
    const response = await fetch(`${API_URL}/upload-url`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileName: file.name,
        fileType: file.type,
      }),
    });

    if (!response.ok) {
<<<<<<< HEAD
      throw new Error(
        `Failed to get upload URL: ${response.status}`
      );
=======
      throw new Error(`Failed to get upload URL: ${response.status}`);
>>>>>>> 458ece2229f06c188c2a98f253153a6a2869956b
    }

    const { uploadUrl, fileKey } = await response.json();

<<<<<<< HEAD
    // 2. Upload file to S3
=======
    // 2. Upload file to private S3
>>>>>>> 458ece2229f06c188c2a98f253153a6a2869956b
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
    });

    if (!uploadResponse.ok) {
<<<<<<< HEAD
      throw new Error(
        `S3 upload failed: ${uploadResponse.status}`
      );
    }

    // 3. Save metadata
=======
      throw new Error(`S3 upload failed: ${uploadResponse.status}`);
    }

    // 3. Save metadata in DynamoDB
>>>>>>> 458ece2229f06c188c2a98f253153a6a2869956b
    const metadataResponse = await fetch(`${API_URL}/resources`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: resourceData.title,
        subject: resourceData.subject,
        type: resourceData.type,
        semester: resourceData.semester,
        description: resourceData.description,
        uploadedBy: 'DS Karthik',
        s3Key: fileKey,
      }),
    });

    if (!metadataResponse.ok) {
      throw new Error(
        `Failed to save resource metadata: ${metadataResponse.status}`
      );
    }

    return {
      success: true,
      message: 'File and resource metadata uploaded successfully',
      fileKey,
    };
  },

<<<<<<< HEAD
  async downloadResource(s3Key) {
    const data = await apiRequest('/download-url', {
      method: 'POST',
      body: JSON.stringify({
        s3Key,
      }),
    });

    if (!data.downloadUrl) {
      throw new Error('Download URL was not returned');
    }

    window.open(data.downloadUrl, '_blank');
=======
  // Generate temporary S3 download URL
  async downloadResource(s3Key) {
    const { tokens } = await fetchAuthSession();

    if (!tokens?.idToken) {
      throw new Error('User is not authenticated');
    }

    const response = await fetch(`${API_URL}/download-url`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokens.idToken.toString()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        s3Key: s3Key,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Download request failed: ${response.status}`
      );
    }

    const data = await response.json();

    const downloadUrl = data.downloadUrl;

    if (!downloadUrl) {
      throw new Error('Download URL was not returned');
    }

    // Open temporary S3 URL
    window.open(downloadUrl, '_blank');
>>>>>>> 458ece2229f06c188c2a98f253153a6a2869956b
  },

  async getRelatedResources(resourceId, subject) {
    const resources = await this.getResources({
      subject,
    });

    return resources
      .filter(r => r.id !== resourceId)
      .slice(0, 3);
  },
<<<<<<< HEAD

  // =========================================================
  // STUDY CLUBS
  // =========================================================

  async createClub(name, subject, description = '') {
    return apiRequest('/clubs', {
      method: 'POST',
      body: JSON.stringify({
        name,
        subject,
        description,
      }),
    });
  },

  async joinClub(clubId) {
    return apiRequest('/clubs/join', {
      method: 'POST',
      body: JSON.stringify({
        clubId,
      }),
    });
  },

  async getClub(clubId) {
    return apiRequest(`/clubs/${clubId}`, {
      method: 'GET',
    });
  },

  // =========================================================
  // DISCUSSION
  // =========================================================

  async getMessages(clubId) {
    return apiRequest(`/clubs/${clubId}/messages`, {
      method: 'GET',
    });
  },

  async postMessage(clubId, message) {
    return apiRequest(`/clubs/${clubId}/messages`, {
      method: 'POST',
      body: JSON.stringify({
        message,
      }),
    });
  },

  // =========================================================
  // AI STUDY ASSISTANT
  // =========================================================

  async askAI(question, subject = '') {
    return apiRequest('/ai/ask', {
      method: 'POST',
      body: JSON.stringify({
        question,
        subject,
      }),
    });
  },

  // =========================================================
  // AI QUIZ GENERATOR
  // =========================================================

  async generateQuiz(topic, count = 5) {
    return apiRequest('/ai/quiz', {
      method: 'POST',
      body: JSON.stringify({
        topic,
        count,
      }),
    });
  },
=======
>>>>>>> 458ece2229f06c188c2a98f253153a6a2869956b
};