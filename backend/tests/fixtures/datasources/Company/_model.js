import { BaseModelDataSource } from '../../../../src/datasources/db/_base-model'
import model from './_name'

export default class extends BaseModelDataSource {
  constructor(args) {
    super(args, model)
    super.model = model
  }
}
