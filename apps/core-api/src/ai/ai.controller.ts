import { Controller, Post, Body, HttpException, HttpStatus } from "@nestjs/common";
import { AiService } from "./ai.service";

@Controller("ai")
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post("tarot")
  async tarot(@Body() body: any) {
    const result = await this.aiService.tarot(body);
    if (!result.result && !result.usage) {
      throw new HttpException("AI provider unavailable — no API key configured", HttpStatus.SERVICE_UNAVAILABLE);
    }
    return result;
  }

  @Post("mbti")
  async mbti(@Body() body: any) {
    const result = await this.aiService.mbti(body);
    if (!result.result && !result.usage) {
      throw new HttpException("AI provider unavailable", HttpStatus.SERVICE_UNAVAILABLE);
    }
    return result;
  }

  @Post("zodiac")
  async zodiac(@Body() body: any) {
    const result = await this.aiService.zodiac(body);
    if (!result.result && !result.usage) {
      throw new HttpException("AI provider unavailable", HttpStatus.SERVICE_UNAVAILABLE);
    }
    return result;
  }

  @Post("zodiac-compatibility")
  async zodiacCompatibility(@Body() body: any) {
    const result = await this.aiService.zodiacCompatibility(body);
    if (!result.result && !result.usage) {
      throw new HttpException("AI provider unavailable", HttpStatus.SERVICE_UNAVAILABLE);
    }
    return result;
  }

  @Post("i-ching")
  async iChing(@Body() body: any) {
    const result = await this.aiService.iChing(body);
    if (!result.result && !result.usage) {
      throw new HttpException("AI provider unavailable", HttpStatus.SERVICE_UNAVAILABLE);
    }
    return result;
  }

  @Post("four-pillars")
  async fourPillars(@Body() body: any) {
    const result = await this.aiService.fourPillars(body);
    if (!result.result && !result.usage) {
      throw new HttpException("AI provider unavailable", HttpStatus.SERVICE_UNAVAILABLE);
    }
    return result;
  }

  @Post("dream")
  async dream(@Body() body: any) {
    const result = await this.aiService.dream(body);
    if (!result.result && !result.usage) {
      throw new HttpException("AI provider unavailable", HttpStatus.SERVICE_UNAVAILABLE);
    }
    return result;
  }

  @Post("feng-shui")
  async fengShui(@Body() body: any) {
    const result = await this.aiService.fengShui(body);
    if (!result.result && !result.usage) {
      throw new HttpException("AI provider unavailable", HttpStatus.SERVICE_UNAVAILABLE);
    }
    return result;
  }

  @Post("numerology")
  async numerology(@Body() body: any) {
    const result = await this.aiService.numerology(body);
    if (!result.result && !result.usage) {
      throw new HttpException("AI provider unavailable", HttpStatus.SERVICE_UNAVAILABLE);
    }
    return result;
  }

  @Post("affirmations")
  async affirmations(@Body() body: any) {
    const result = await this.aiService.affirmations(body);
    if (!result.result && !result.usage) {
      throw new HttpException("AI provider unavailable", HttpStatus.SERVICE_UNAVAILABLE);
    }
    return result;
  }
}
