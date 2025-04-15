import { Button, ButtonProps } from '@mantine/core';

/**
 * RoundedButton Component
 *
 * A customizable button with rounded corners that extends Mantine's Button component.
 * Supports outline and filled variants with customizable colors and border width.
 *
 * @param variant - Button style variant (outline or filled). Defaults to 'outline'.
 * @param color - The color of the button.
 * @param textColor - The text color of the button.
 * @param borderWidth - Custom border width for outline variant.
 * @param children - Content to display inside the button.
 * @param otherProps - Additional props passed to the Mantine Button component.
 */
interface RoundedButtonProps extends Omit<ButtonProps, 'radius' | 'variant' | 'color'> {
    variant?: 'outline' | 'filled';
    color?: string;
    textColor?: string;
    borderWidth?: number | string;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

export function RoundedButton({
                                  variant = 'outline',
                                  color,
                                  textColor,
                                  borderWidth,
                                  onClick,
                                  children,
                                  ...otherProps
                              }: RoundedButtonProps) {
    // Format textColor if it contains a dot (e.g., "brightPurple.6" -> "var(--mantine-color-brightPurple-6)")
    const formattedTextColor = textColor && textColor.includes('.')
        ? `var(--mantine-color-${textColor.replace('.', '-')})`
        : textColor;
    const formattedColor = color && color.includes('.')
        ? `var(--mantine-color-${color.replace('.', '-')})`
        : textColor;

    const styles = {
        root: {
            ...(borderWidth !== undefined && variant === 'outline' && {
                border: `${borderWidth}px solid ${formattedColor}`,
            }),
            ...(formattedTextColor && { color: formattedTextColor }),
        },
        // For filled variant, we need to target the inner label
        label: {
            ...(formattedTextColor && variant === 'filled' && { color: formattedTextColor }),
        },
    };

    return (
        <Button
            radius="xl"
            variant={variant}
            color={color}
            styles={styles}
            onClick={onClick}
            {...otherProps}
        >
            {children}
        </Button>
    );
}

export default RoundedButton;