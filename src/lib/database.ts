import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { User, Character, Message, Conversation } from '@/types';

const prisma = new PrismaClient();

export class DatabaseService {
  static async createUser(userData: Omit<User, 'id' | 'createdAt' | 'characters'> & { password: string }): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        password: hashedPassword,
        name: userData.name,
        nickname: userData.nickname,
      },
      include: {
        characters: true,
      },
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      nickname: user.nickname,
      createdAt: user.createdAt,
      characters: [],
    };
  }

  static async authenticateUser(email: string, password: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        characters: true,
      },
    });

    if (!user) return null;

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return null;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      nickname: user.nickname,
      createdAt: user.createdAt,
      characters: user.characters.map(char => ({
        id: char.id,
        name: char.name,
        nickname: char.nickname,
        gender: char.gender as 'boyfriend' | 'girlfriend',
        age: char.age,
        occupation: char.occupation,
        hobbies: JSON.parse(char.hobbies),
        personality: JSON.parse(char.personality),
      })),
    };
  }

  static async createCharacter(characterData: Omit<Character, 'id'> & { userId: string }): Promise<Character> {
    const character = await prisma.character.create({
      data: {
        name: characterData.name,
        nickname: characterData.nickname,
        gender: characterData.gender,
        age: characterData.age,
        occupation: characterData.occupation,
        hobbies: JSON.stringify(characterData.hobbies),
        personality: JSON.stringify(characterData.personality),
        userId: characterData.userId,
      },
    });

    return {
      id: character.id,
      name: character.name,
      nickname: character.nickname,
      gender: character.gender as 'boyfriend' | 'girlfriend',
      age: character.age,
      occupation: character.occupation,
      hobbies: JSON.parse(character.hobbies),
      personality: JSON.parse(character.personality),
    };
  }

  static async getOrCreateConversation(userId: string, characterId: string): Promise<Conversation> {
    let conversation = await prisma.conversation.findFirst({
      where: {
        userId,
        characterId,
      },
      include: {
        messages: {
          orderBy: {
            timestamp: 'asc',
          },
        },
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          userId,
          characterId,
          context: '',
        },
        include: {
          messages: true,
        },
      });
    }

    return {
      id: conversation.id,
      userId: conversation.userId,
      characterId: conversation.characterId,
      lastActiveAt: conversation.lastActiveAt,
      context: conversation.context || '',
      messages: conversation.messages.map(msg => ({
        id: msg.id,
        senderId: msg.senderId,
        content: msg.content,
        timestamp: msg.timestamp,
        type: msg.type as 'text' | 'image' | 'audio',
        isRead: msg.isRead,
        isUser: msg.isUser,
      })),
    };
  }

  static async addMessage(conversationId: string, messageData: Omit<Message, 'id' | 'timestamp'>): Promise<Message> {
    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: messageData.senderId,
        content: messageData.content,
        type: messageData.type,
        isRead: messageData.isRead,
        isUser: messageData.isUser,
      },
    });

    // Update conversation lastActiveAt
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { lastActiveAt: new Date() },
    });

    return {
      id: message.id,
      senderId: message.senderId,
      content: message.content,
      timestamp: message.timestamp,
      type: message.type as 'text' | 'image' | 'audio',
      isRead: message.isRead,
      isUser: message.isUser,
    };
  }

  static async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    await prisma.message.updateMany({
      where: {
        conversationId,
        isUser: false, // Only mark AI messages as read
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
  }

  static async updateConversationContext(conversationId: string, context: string): Promise<void> {
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { context },
    });
  }

  static async getUserWithCharacters(userId: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        characters: true,
      },
    });

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      nickname: user.nickname,
      createdAt: user.createdAt,
      characters: user.characters.map(char => ({
        id: char.id,
        name: char.name,
        nickname: char.nickname,
        gender: char.gender as 'boyfriend' | 'girlfriend',
        age: char.age,
        occupation: char.occupation,
        hobbies: JSON.parse(char.hobbies),
        personality: JSON.parse(char.personality),
      })),
    };
  }
}

export default prisma;