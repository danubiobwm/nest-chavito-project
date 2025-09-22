import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';


async function bootstrap() {
const app = await NestFactory.create(AppModule);
app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));


const config = new DocumentBuilder()
.setTitle('Chavito School API')
.setDescription('API para gerenciar escola do Chavito')
.setVersion('1.0')
.build();
const doc = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api', app, doc);


await app.listen(3000);
console.log('Listening on http://localhost:3000');
}
bootstrap();