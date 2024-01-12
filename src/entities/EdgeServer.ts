import { DataTypes, Model } from "sequelize";
import { db } from "./BaseEntity";
import UserGroupEntity from "./UserGroup";
import DeviceEntity from "./DeviceEntity";
import DeviceEdgeServerEntity from "./DeviceEdgeServer";
import NotificationEntity from "./NotificationEntity";
import SensorDataEntity from "./SensorDataEntity";

class EdgeServerEntity extends Model {}

EdgeServerEntity.init({
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      vendor: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      mqtt_user: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      mqtt_password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      mqtt_pub_topic: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      mqtt_sub_topic: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      invitation_code: {
        type: DataTypes.STRING(6),
        allowNull: true,
      },
      invitation_expired_at: {
        type: DataTypes.DATE,
        allowNull: true,
      }
}, {
    sequelize: db.getConnection(), 
    modelName: 'EdgeServer', 
    tableName: 'edge_servers',
    timestamps: false,
    underscored: true
})

EdgeServerEntity.hasMany(UserGroupEntity, {foreignKey: "edge_server_id", as: "user_groups"})

EdgeServerEntity.hasMany(NotificationEntity, {foreignKey: "edge_server_id"})
NotificationEntity.belongsTo(EdgeServerEntity, {foreignKey: "edge_server_id"})

DeviceEntity.hasMany(NotificationEntity, {foreignKey: "device_id", as: "notifications"})
NotificationEntity.belongsTo(DeviceEntity, {foreignKey: "device_id"})

EdgeServerEntity.belongsToMany(DeviceEntity, {through: DeviceEdgeServerEntity, as: "devices"})
DeviceEntity.belongsToMany(EdgeServerEntity, {through: DeviceEdgeServerEntity, as: "edge_servers"})

EdgeServerEntity.hasMany(SensorDataEntity, {foreignKey: "edge_server_id", as: "sensor_data"})
SensorDataEntity.belongsTo(EdgeServerEntity, {foreignKey: "edge_server_id"})

DeviceEntity.hasMany(SensorDataEntity, {foreignKey: "device_id", as: "sensor_data"})
SensorDataEntity.belongsTo(DeviceEntity, {foreignKey: "device_id"})

export default EdgeServerEntity