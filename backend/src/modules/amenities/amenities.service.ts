import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Amenity } from "./amenity.entity";
import { CreateAmenityDto } from "./dto/create-amenity.dto";

@Injectable()
export class AmenitiesService {
  constructor(
    @InjectRepository(Amenity) private readonly repo: Repository<Amenity>,
  ) {}

  async findAll() {
    try {
      return this.repo.find({ order: { name: "ASC" } });
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      const amenity = await this.repo.findOne({ where: { id } });
      if (!amenity) throw new NotFoundException("Amenity not found");
      return amenity;
    } catch (error) {
      throw error;
    }
  }

  async create(payload: CreateAmenityDto) {
    try {
      return this.repo.save(this.repo.create(payload));
    } catch (error) {
      throw error;
    }
  }

  async update(id: string, payload: Partial<CreateAmenityDto>) {
    try {
      const amenity = await this.findOne(id);
      Object.assign(amenity, payload);
      return this.repo.save(amenity);
    } catch (error) {
      throw error;
    }
  }

  async deactivate(id: string) {
    try {
      const amenity = await this.findOne(id);
      amenity.isActive = false;
      return this.repo.save(amenity);
    } catch (error) {
      throw error;
    }
  }
}
