import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database/mysql';
import { User } from './User';

interface SiteAttributes {
  id: number;
  userId: number;
  url: string;
  trackingKey: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface SiteCreationAttributes extends Optional<SiteAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class Site extends Model<SiteAttributes, SiteCreationAttributes> implements SiteAttributes {
  public id!: number;
  public userId!: number;
  public url!: string;
  public trackingKey!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Site.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    url: {
      type: DataTypes.STRING(500),
      allowNull: false,
      validate: {
        isUrl: true,
      },
    },
    trackingKey: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true,
    },
  },
  {
    sequelize,
    tableName: 'sites',
    timestamps: true,
  }
);

// Define associations
User.hasMany(Site, { foreignKey: 'userId', as: 'sites' });
Site.belongsTo(User, { foreignKey: 'userId', as: 'user' });

