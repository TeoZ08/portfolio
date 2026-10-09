// Chibi stride calibration; controller, collision, gravity and dash are unchanged.
export const PLAYER_TRAVERSAL = {
  walkSpeed: 3.6,
  sprintSpeed: 6.2,
  maximumHorizontalSpeed: 9.4,
  horizontalAcceleration: 28,
  horizontalDeceleration: 34,
  gravity: -20,
  jumpVelocity: 6.2,
  jumpCooldown: 0.42,
  dashHopSpeed: 9.2,
  dashHopDuration: 0.18,
  dashMinimumInput: 0.35,
} as const;

type JumpRuleInput = {
  blocked: boolean;
  cooldownRemaining: number;
  grounded: boolean;
  jumpPressed: boolean;
};

type DashHopRuleInput = JumpRuleInput & {
  inputMagnitude: number;
  sprinting: boolean;
};

export function getManualTraversalSpeed(
  inputMagnitude: number,
  sprinting: boolean,
  blocked = false,
) {
  if (blocked || inputMagnitude <= 0) {
    return 0;
  }

  return Math.min(
    sprinting ? PLAYER_TRAVERSAL.sprintSpeed : PLAYER_TRAVERSAL.walkSpeed,
    PLAYER_TRAVERSAL.maximumHorizontalSpeed,
  );
}

export function canStartJump({
  blocked,
  cooldownRemaining,
  grounded,
  jumpPressed,
}: JumpRuleInput) {
  return (
    !blocked &&
    grounded &&
    jumpPressed &&
    cooldownRemaining <= 0
  );
}

export function getDashHopSpeed(input: DashHopRuleInput) {
  if (
    !canStartJump(input) ||
    !input.sprinting ||
    input.inputMagnitude < PLAYER_TRAVERSAL.dashMinimumInput
  ) {
    return null;
  }

  return Math.min(
    PLAYER_TRAVERSAL.dashHopSpeed,
    PLAYER_TRAVERSAL.maximumHorizontalSpeed,
  );
}
