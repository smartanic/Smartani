import { DataTypes, Model } from "sequelize";
import { db } from "./BaseEntity";

class UserGroupEntity extends Model { }

UserGroupEntity.init({
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    // allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  role_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  edge_server_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    // allowNull: false,
    references: {
      model: 'edge_servers',
      key: 'id'
    }
  },
}, {
  sequelize: db.getConnection(),
  modelName: 'UserGroup',
  tableName: 'user_groups',
  timestamps: false,
  underscored: true
})

export default UserGroupEntity