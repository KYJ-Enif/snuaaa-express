import { Model } from 'sequelize';

module.exports = (sequelize, DataTypes) => {

    class Board extends Model {

        static init() {
            super.init({
                board_id: {
                    type: DataTypes.STRING(16),
                    allowNull: false,
                    primaryKey: true,
                },
                board_name: {
                    type: DataTypes.STRING(32),
                    allowNull: false,
                },
                board_type: {
                    type: DataTypes.STRING(16),
                },
                board_desc: {
                    type: DataTypes.TEXT,
                },
                menu: {
                    type: DataTypes.INTEGER,
                },
                order: {
                    type: DataTypes.INTEGER,
                },
                lv_read: {
                    type: DataTypes.INTEGER,
                },
                lv_write: {
                    type: DataTypes.INTEGER,
                },
                lv_edit: {
                    type: DataTypes.INTEGER,
                }
            }, {
                    sequelize,
                    modelName: 'board',
                    tableName: 'tb_board',
                    timestamps: false,
                    underscored: true
                }
            );
        }

        static associate(models) {
            this.hasMany(models.Tag, {
                as: 'tags',
                foreignKey: 'board_id'
            })

            this.hasMany(models.Category, {
                as: 'categories',
                foreignKey: 'board_id'
            })
        }
    }

    return Board;
}
