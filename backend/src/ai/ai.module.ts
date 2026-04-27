import { Module } from '@nestjs/common';
import { AiResolver } from './ai.resolver';
import { AiService } from './ai.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [AiResolver, AiService],
})
export class AiModule {}
