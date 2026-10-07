import { fetchAuthSession } from 'aws-amplify/auth';
import { resourceService } from './resourceService';
import { mockStudyGroups } from '../data/mockGroups';

const AWS_CLUB_MAP = {
  'group-001': '7A5D5FFA',
  'group-002': 'WEBDEV01',
  'group-003': 'AIDEEP01',
  'group-004': 'DBMS001',
};

export const groupService = {

  async getGroups() {
    return mockStudyGroups;
  },

  async getMyGroups() {
    return mockStudyGroups.filter(g => g.isJoined);
  },

  async getGroupById(id) {
    const awsClubId = AWS_CLUB_MAP[id] || id;

    try {
      let data = await resourceService.getClub(awsClubId);

      // Get current Cognito user
      const { tokens } = await fetchAuthSession();
      const currentUserId = tokens?.idToken?.payload?.sub;

      // Check whether current user is already a member
      const isMember = data.members?.some(
        member => member.userId === currentUserId
      );

      // Automatically join the demo club if needed
      if (currentUserId && !isMember) {
        console.log('Joining AWS club:', awsClubId);

        await resourceService.joinClub(awsClubId);

        // Reload club so member count is updated
        data = await resourceService.getClub(awsClubId);
      }

      const club = data.club;
      const mockGroup =
        mockStudyGroups.find(g => g.id === id) || {};

      return {
        ...mockGroup,
        id,
        awsClubId: club.clubId,
        name: club.name,
        subject: club.subject,
        description: club.description || '',
        members: club.memberCount || data.members?.length || 0,
        createdDate: club.createdAt
          ? new Date(club.createdAt).toLocaleDateString()
          : '',
        isActive: true,
        isJoined: true,
        avatar: mockGroup.avatar || '📚',
      };

    } catch (error) {
      console.error('Error loading AWS club:', error);

      const group = mockStudyGroups.find(g => g.id === id);

      if (!group) {
        throw new Error('Group not found');
      }

      return group;
    }
  },

  async joinGroup(groupId) {
    const awsClubId = AWS_CLUB_MAP[groupId] || groupId;
    return resourceService.joinClub(awsClubId);
  },

  async leaveGroup(groupId) {
    return {
      success: true,
      message: 'Leave group will be added later',
    };
  },

  async getGroupPosts(groupId) {
    const awsClubId = AWS_CLUB_MAP[groupId] || groupId;

    try {
      const data = await resourceService.getMessages(awsClubId);

      return (data.messages || []).map(message => ({
        id: message.messageId,
        author:
          message.userId === 'TEST-USER-001'
            ? 'DS Karthik'
            : 'Club Member',
        avatar: '👨‍🎓',
        content: message.message,
        time: message.createdAt
          ? formatTime(message.createdAt)
          : 'Just now',
        likes: 0,
        isLiked: false,
        comments: [],
      }));

    } catch (error) {
      console.error('Error loading discussions:', error);
      return [];
    }
  },

  async addPost(groupId, content) {
    const awsClubId = AWS_CLUB_MAP[groupId] || groupId;

    return resourceService.postMessage(
      awsClubId,
      content
    );
  },

  async likePost(postId) {
    return { success: true };
  },

  async addComment(postId, content) {
    return {
      success: true,
      message: 'Comments will be added later',
    };
  },

  async getGroupMembers(groupId) {
    const awsClubId = AWS_CLUB_MAP[groupId] || groupId;

    try {
      const data = await resourceService.getClub(awsClubId);

      return (data.members || []).map(member => ({
        id: member.userId,
        name:
          member.userId === 'TEST-USER-001'
            ? 'DS Karthik'
            : 'Club Member',
        avatar: '👨‍🎓',
        role: member.role || 'MEMBER',
        joinedDate: member.joinedAt
          ? new Date(member.joinedAt).toLocaleDateString()
          : '',
      }));

    } catch (error) {
      console.error('Error loading members:', error);
      return [];
    }
  },

  async searchGroups(query) {
    const lowerQuery = query.toLowerCase();

    return mockStudyGroups.filter(g =>
      g.name.toLowerCase().includes(lowerQuery) ||
      g.description.toLowerCase().includes(lowerQuery) ||
      g.subject.toLowerCase().includes(lowerQuery)
    );
  },
};

function formatTime(timestamp) {
  const date = new Date(timestamp);
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return 'Just now';

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }

  const days = Math.floor(hours / 24);

  return `${days} day${days > 1 ? 's' : ''} ago`;
}