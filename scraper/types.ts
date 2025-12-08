// Types :)

export interface NullableValue<T> {
  nil?: boolean;
  value?: T;
}

export interface Space {
  space_favorite: string;
  building_name: NullableValue<string> | { nil: true };
  space_name: string;
  related_space_name: NullableValue<string> | { nil: true };
  related_space_id: NullableValue<number> | { nil: true };
  space_id: number;
  formal_name: string;
}

export interface EventDetails {
  post_event_dt: string;
  event_end_dt: string;
  event_title: NullableValue<string> | { nil: true };
  event_locator: NullableValue<string> | { nil: true };
  organization_name: string;
  event_type_class: NullableValue<string> | { nil: true };
  event_type_name: NullableValue<string> | { nil: true };
  event_type_id: NullableValue<number> | { nil: true };
  profile_name: string;
  event_id: number;
  pre_event_dt: string;
  state_name: NullableValue<string> | { nil: true };
  creation_dt: NullableValue<string> | { nil: true };
  profile_id: NullableValue<number> | { nil: true };
  organization_id: NullableValue<number> | { nil: true };
  registered_count: NullableValue<number> | { nil: true };
  event_name: string;
  expected_count: NullableValue<number> | { nil: true };
  state: NullableValue<number> | { nil: true };
  event_start_dt: string;
}

export interface SpaceReservation {
  shared: string;
  registration_url: string;
  layout_id: number;
  layout_name: NullableValue<string> | { nil: true };
  space_instructions: NullableValue<string> | { nil: true };
  space_instruction_id: NullableValue<number> | { nil: true };
  last_mod_dt: string;
  reservation_type: number;
  reservation_state: number;
  reservation_start_dt: string;
  reservation_comments: NullableValue<string> | { nil: true };
  reservation_id: number;
  act_head_count: NullableValue<number> | { nil: true };
  reservation_comment_id: NullableValue<number> | { nil: true };
  reservation_end_dt: string;
  spaces: Space;
  last_mod_user: string;
  event: EventDetails;
}

export interface SpaceReservations {
  engine: string;
  space_reservation: SpaceReservation[];
}

export interface SuperCalendarDataResponse {
  space_reservations: SpaceReservations;
}