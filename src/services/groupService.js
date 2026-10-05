import { mockStudyGroups, mockGroupPosts, mockGroupMembers } from '../data/mockGroups';

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const groupService = {
  // Get all study groups
  async getGroups() {
    await delay();
    return mockStudyGroups;
  },

  // Get groups user has joined
  async getMyGroups() {
    await delay();
    return mockStudyGroups.filter(g => g.isJoined);
  },

  // Get group by ID
  async getGroupById(id) {
    await delay();
    const group = mockStudyGroups.find(g => g.id === id);
    if (!group) {
      throw new Error('Group not found');
    }
    return group;
  },

  // Join a group
  async joinGroup(groupId) {
    await delay();
    return { success: true, message: 'Joined group successfully' };
  },

  // Leave a group
  async leaveGroup(groupId) {
    await delay();
    return { success: true, message: 'Left group successfully' };
  },

  // Get group posts
  async getGroupPosts(groupId) {
    await delay();
    return mockGroupPosts[groupId] || [];
  },

  // Add a post to a group
  async addPost(groupId, content) {
    await delay();
    return {
      success: true,
      message: 'Post added successfully',
      postId: `post-${Date.now()}`,
    };
  },

  // Like a post
  async likePost(postId) {
    await delay();
    return { success: true };
  },

  // Add comment to a post
  async addComment(postId, content) {
    await delay();
    return {
      success: true,
      message: 'Comment added successfully',
      commentId: `comment-${Date.now()}`,
    };
  },

  // Get group members
  async getGroupMembers(groupId) {
    await delay();
    return mockGroupMembers;
  },

  // Search groups
  async searchGroups(query) {
    await delay();
    const lowerQuery = query.toLowerCase();
    return mockStudyGroups.filter(g =>
      g.name.toLowerCase().includes(lowerQuery) ||
      g.description.toLowerCase().includes(lowerQuery) ||
      g.subject.toLowerCase().includes(lowerQuery)
    );
  },
};
