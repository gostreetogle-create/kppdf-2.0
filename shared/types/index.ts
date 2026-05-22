export type {
  KpStatus,
  KpType,
  IKpItem,
  IKpRecipientSnapshot,
  IKpMetadata,
  IKpCompanySnapshot,
  IKpVersionMeta,
  IKp,
} from './kp.interface';

export type {
  ProductKind,
  IProduct,
} from './product.interface';

export type {
  CounterpartyLegalForm,
  CounterpartyRole,
  ICounterpartyBrandingTemplate,
  ICounterparty,
} from './counterparty.interface';

export type {
  UserRole,
  IUser,
  IAuthTokens,
  ILoginRequest,
  ILoginResponse,
} from './user.interface';

export type {
  ISetting,
  ISettingsMap,
} from './settings.interface';

export type {
  DictionaryKind,
  IDictionaryItem,
} from './dictionary.interface';

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

// ─── Document Engine (Этап H) ────────────────────────────────
export type {
  DocumentEntityType,
  DocumentStatus,
  OverlayType,
  PageBreakMode,
  OverlayTextAlign,
  IOverlayStyle,
  ITableColumnDef,
  IOverlayDef,
  IDocumentPage,
  IDocumentTemplate,
  IDocument,
  IResolvedData,
  CreateDocumentTemplateDto,
  CreateDocumentDto,
  UpdateDocumentDto,
} from './document.types';
