import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  timestamps: true,
  paranoid: true,
  tableName: 'Apps',
})
export class App extends Model<App> {
  @Column(DataType.STRING)
  name: string;

  @Column(DataType.TEXT)
  description: string;

  @Column(DataType.BOOLEAN)
  online: string;

  @Column(DataType.STRING)
  image: string;
}
