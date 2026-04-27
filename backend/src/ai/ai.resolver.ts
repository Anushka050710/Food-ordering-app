import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Resolver()
export class AiResolver {
  constructor(private aiService: AiService) {}

  // Feature 1: Chatbot
  @Mutation(() => String)
  @UseGuards(JwtAuthGuard)
  async aiChat(
    @Args('message') message: string,
    @CurrentUser() user: any,
  ): Promise<string> {
    return this.aiService.chat(message, user.id);
  }

  // Feature 2: Recommendations
  @Query(() => String)
  @UseGuards(JwtAuthGuard)
  async aiRecommendations(@CurrentUser() user: any): Promise<string> {
    return this.aiService.getRecommendations(user.id);
  }

  // Feature 3: Natural Language Search
  @Query(() => String)
  @UseGuards(JwtAuthGuard)
  async aiSearch(
    @Args('query') query: string,
    @CurrentUser() user: any,
  ): Promise<string> {
    return this.aiService.naturalLanguageSearch(query, user.id);
  }
}
