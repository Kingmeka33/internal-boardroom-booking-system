import { BadRequestException } from "@nestjs/common";
import { strict as assert } from "assert";
import { firstValueFrom, of } from "rxjs";
import { AutoMapper } from "../shared/mapping/auto-mapper";
import { ApiResponseInterceptor } from "../shared/interceptors/api-response.interceptor";
import { FluentValidator } from "../shared/validation/fluent-validator";

async function testFluentValidator(): Promise<void> {
  assert.doesNotThrow(() => {
    new FluentValidator()
      .require(true, "should not fail")
      .requireValue("value", "value should exist")
      .throwIfInvalid();
  });

  assert.throws(
    () => new FluentValidator().require(false, "expected failure").throwIfInvalid(),
    BadRequestException,
  );
}

function testAutoMapperEntityMapping(): void {
  const amenity = AutoMapper.toAmenityEntity({
    name: "Projector",
    description: "Room has a projector",
    icon: "projector",
    isActive: true,
  } as any);

  assert.deepEqual(amenity, {
    name: "Projector",
    description: "Room has a projector",
    icon: "projector",
    isActive: true,
  });

  const room = AutoMapper.toBoardroomEntity({
    name: "Executive Boardroom",
    code: "BR-01",
    capacity: 12,
    openingTime: "08:00",
    closingTime: "17:00",
  } as any);

  assert.equal(room.name, "Executive Boardroom");
  assert.equal(room.code, "BR-01");
  assert.equal(room.capacity, 12);
}

async function testApiResponseInterceptor(): Promise<void> {
  const interceptor = new ApiResponseInterceptor();
  const context = {
    switchToHttp: () => ({
      getRequest: () => ({ url: "/health" }),
    }),
  } as any;
  const next = { handle: () => of({ status: "ok" }) } as any;

  const result = await firstValueFrom(interceptor.intercept(context, next));
  assert.equal(result.success, true);
  assert.deepEqual(result.data, { status: "ok" });
  assert.equal(result.path, "/health");
  assert.ok(result.timestamp);
}

async function main(): Promise<void> {
  await testFluentValidator();
  testAutoMapperEntityMapping();
  await testApiResponseInterceptor();
  console.log("Smoke tests passed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
