import { fetchAuthSession } from 'aws-amplify/auth';

const API_URL =
  'https://vaja7mf7u4.execute-api.ap-south-1.amazonaws.com';

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

      // Client-side filtering
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

    } catch (error) {
      console.error('Error loading resources from AWS:', error);
      throw error;
    }
  },

  async getResourceById(id) {
    throw new Error('Resource details API not implemented yet');
  },

  async searchResources(query) {
    const resources = await this.getResources({
      search: query,
    });

    return resources;
  },

  async saveResource(id) {
    return {
      success: true,
      message: 'Resource saved successfully',
    };
  },

  async uploadResource(resourceData) {
    const { tokens } = await fetchAuthSession();

    if (!tokens?.idToken) {
      throw new Error('User is not authenticated');
    }

    const file = resourceData.file;
    const token = tokens.idToken.toString();

    // 1. Get S3 pre-signed URL
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
      throw new Error(`Failed to get upload URL: ${response.status}`);
    }

    const { uploadUrl, fileKey } = await response.json();

    // 2. Upload file to private S3
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
    });

    if (!uploadResponse.ok) {
      throw new Error(`S3 upload failed: ${uploadResponse.status}`);
    }

    // 3. Save metadata in DynamoDB
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
  },

  async getRelatedResources(resourceId, subject) {
    const resources = await this.getResources({
      subject,
    });

    return resources
      .filter(r => r.id !== resourceId)
      .slice(0, 3);
  },
};