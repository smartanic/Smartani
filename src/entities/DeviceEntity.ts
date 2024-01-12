import { DataTypes, Model } from "sequelize";
import { db } from "./BaseEntity";

class DeviceEntity extends Model { }

DeviceEntity.init({
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    vendor_name: {
        type: DataTypes.CHAR(255),
        allowNull: false,
    },
    vendor_number: {
        type: DataTypes.CHAR(255),
        allowNull: false,
    },
    type: {
        type: DataTypes.STRING(32),
        allowNull: false,
    },
    source_type: {
        type: DataTypes.STRING(32),
        allowNull: false,
    },
    source_address: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    assigned_model_type: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
    },
    assigned_model_index: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
    },
    additional_info: {
        type: DataTypes.TEXT,
        allowNull: true,
    }
}, {
    sequelize: db.getConnection(),
    modelName: 'Device',
    tableName: 'devices',
    timestamps: false,
    underscored: true
})

export default DeviceEntity