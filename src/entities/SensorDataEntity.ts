import { DataTypes, Model } from "sequelize";
import { db } from "./BaseEntity";

class SensorDataEntity extends Model {}

SensorDataEntity.init({
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    edge_server_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    device_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    data_measured: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: 0,
    },
    inference_label_status: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    captured_at: {
      type: DataTypes.DATE,
      allowNull: false,
    }
  }, {
    sequelize: db.getConnection(), 
    modelName: 'SensorData', 
    tableName: 'sensor_data',
    timestamps: false,
    underscored: true
})

export default SensorDataEntity