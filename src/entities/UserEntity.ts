import { DataTypes, Model } from "sequelize";
import { db } from "./BaseEntity"
import NotificationEntity from "./NotificationEntity";
import UserGroupEntity from "./UserGroup";

class UserEntity extends Model { }

UserEntity.init({
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
    // allowNull defaults to true
  },
  password: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  avatar:{
    type:DataTypes.TEXT,
    allowNull: true
  },
  reset_token: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  verification_code: {
    type: DataTypes.STRING(6),
    allowNull: true
  },
  fcm_registration_token: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  sequelize: db.getConnection(),
  modelName: 'User',
  tableName: 'users',
  underscored: true,
});

UserEntity.hasMany(NotificationEntity)
UserEntity.hasMany(UserGroupEntity, { foreignKey: 'user_id'})

export default UserEntity
