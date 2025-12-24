"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: true,
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    const config = new swagger_1.DocumentBuilder()
        .setTitle("Foozam API")
        .setDescription("Shazam for food - AI-powered food recognition")
        .setVersion("1.0")
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup("api", app, document);
    if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
        await app.init();
        return app.getHttpAdapter().getInstance();
    }
    else {
        const port = process.env.PORT || 3000;
        await app.listen(port);
        console.log(`🚀 Foozam API running on port ${port}`);
    }
}
exports.default = bootstrap();
//# sourceMappingURL=main.js.map