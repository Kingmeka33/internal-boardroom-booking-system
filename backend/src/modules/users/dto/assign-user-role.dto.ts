import { ApiProperty } from "@nestjs/swagger";
import { IsUUID } from "class-validator";

export class AssignUserRoleDto {
  @ApiProperty({ example: "b1b2c3d4-1111-2222-3333-444444444444" })
  @IsUUID("4")
  roleId: string;
}
