import { Model } from 'sequelize';

module.exports = (sequelize, DataTypes) => {

    class Content extends Model {

        static init() {
            super.init({
                content_id: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    primaryKey: true,
                    autoIncrement: true
                },
                content_uuid: {
                    type: DataTypes.UUID,
                    allowNull: true
                },
                author_id: {
                    type: DataTypes.INTEGER,
                    allowNull: false
                },
                board_id: {
                    type: DataTypes.STRING(16),
                },
                category_id: {
                    type: DataTypes.STRING(16),
                },
                type: {
                    type: DataTypes.STRING(16),
                },
                title: {
                    type: DataTypes.STRING(64),
                },
                text: {
                    type: DataTypes.TEXT,
                },
                view_num: {
                    type: DataTypes.INTEGER,
                    defaultValue: 0
                },
                comment_num: {
                    type: DataTypes.INTEGER,
                    defaultValue: 0
                },
                like_num: {
                    type: DataTypes.INTEGER,
                    defaultValue: 0
                }
            }, {
                    sequelize,
                    modelName: 'content',
                    tableName: 'tb_content',
                    timestamps: true,
                    paranoid: true,
                    underscored: true
                }
            );
        }

        static associate(models) {
            this.belongsTo(models.Board, {
                foreignKey: 'board_id',
                targetKey: 'board_id'
            })

            this.belongsTo(models.User, {
                foreignKey: 'author_id',
                targetKey: 'user_id'
            })

            this.belongsTo(models.Category, {
                foreignKey: 'category_id',
                targetKey: 'category_id'
            })

            this.belongsToMany(models.User, {
                through: 'ContentLike',
                foreignKey: 'content_id',
                otherKey: 'content_id'
            })

            this.belongsToMany(models.Tag, {
                through: 'contentTag',
                foreignKey: 'content_id',
                otherKey: 'tag_id'
            })
        }
    }

    return Content;
}