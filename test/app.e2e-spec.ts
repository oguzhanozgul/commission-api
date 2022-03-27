import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "./../src/app.module";

describe("AppController (e2e)", () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(() => {
    app.close();
  });

  it("/client/details (GET)", () => {
    return request(app.getHttpServer())
      .get("/client/details")
      .send({ client_id: 1 })
      .expect(200)
      .expect({ id: 1, client_name: "Acme Inc" });
  });
});
