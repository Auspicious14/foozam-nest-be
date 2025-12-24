import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { Express } from "express";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle("Foozam API")
    .setDescription("Shazam for food - AI-powered food recognition")
    .setVersion("1.0")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
    await app.init();
    return app.getHttpAdapter().getInstance() as any as Express;
  } else {
    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`🚀 Foozam API running on port ${port}`);
  }
}

export default bootstrap();
