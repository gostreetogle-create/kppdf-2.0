export type {
  ProductKind,
  IProduct,
} from './product.interface';

export type {
  UserRole,
  IUser,
  IAuthTokens,
  ILoginRequest,
  ILoginResponse,
} from './user.interface';

// ─── PLM Core ───────────────────────────────────────────────
export type {
  AttrValueType,
  LifecycleStatus,
  ComparisonOperator,
  IAttributeDef,
  IAttributeValue,
  IAttributeGroup,
} from './attribute.types';

export type {
  BOMNodeType,
  BOMStatus,
  IComponentNode,
} from './bom.types';

export type {
  MaterialCategory,
  IMaterialItem,
} from './material.types';

export type {
  IProductCategory,
  ICategoryValidation,
} from './category.types';

export type {
  IRequirement,
} from './requirement.types';

export type {
  IProcessOp,
} from './process.types';
