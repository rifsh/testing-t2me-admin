import React, { useState } from 'react';
import PropTypes from 'prop-types'
import { Avatar } from 'antd';
import { UserOutlined, LinkOutlined, WarningOutlined } from '@ant-design/icons';

const isValidUrl = (url) => {
	if (!url) return false;
	try {
		new URL(url);
		return true;
	} catch (e) {
		return false;
	}
};

const RenderAvatar = props => {
	const { src, icon, type, size, shape, gap, text, onImageError } = props;
	const [imageError, setImageError] = useState(false);
	const [imageLoading, setImageLoading] = useState(!!src);

	// Handle image loading errors
	const handleImageError = () => {
		setImageError(true);
		setImageLoading(false);
		// Call custom error handler if provided
		if (onImageError) {
			onImageError(src);
		}
	};

	// Handle image loading success
	const handleImageLoad = () => {
		setImageLoading(false);
		setImageError(false);
	};

	// Get appropriate icon based on error type
	const getErrorIcon = () => {
		if (!isValidUrl(src)) {
			return <WarningOutlined title="Invalid URL" />;
		}
		return <LinkOutlined title="Broken link" />;
	};

	// Handle null/undefined/empty/invalid src cases
	if (!src || !isValidUrl(src) || imageError) {
		// If we have text, use it for the avatar
		if (text) {
			return (
				<Avatar
					{...props}
					className={`ant-avatar-${type} ${imageError ? 'avatar-error' : ''}`}
					icon={imageError ? getErrorIcon() : null}
				>
					{text}
				</Avatar>
			);
		}
		// If we have an icon, use it
		if (icon) {
			return (
				<Avatar
					{...props}
					className={`ant-avatar-${type} ${imageError ? 'avatar-error' : ''}`}
					icon={imageError ? getErrorIcon() : icon}
				/>
			);
		}
		// Default fallback - user icon or error icon
		return (
			<Avatar
				{...props}
				className={`ant-avatar-${type} ${imageError ? 'avatar-error' : ''}`}
				icon={imageError ? getErrorIcon() : <UserOutlined />}
			/>
		);
	}

	// If valid src is provided, use it with error handling
	return (
		<Avatar
			{...props}
			className={`ant-avatar-${type} ${imageLoading ? 'avatar-loading' : ''}`}
			src={src}
			onError={handleImageError}
			onLoad={handleImageLoad}
			alt={text || "Avatar"}
		>
			{imageLoading && <UserOutlined className="avatar-loading-icon" />}
			{text}
		</Avatar>
	);
}

export const AvatarStatus = props => {
	const {
		name,
		suffix,
		subTitle1,
		subTitle2,
		id,
		type,
		src,
		icon,
		size,
		shape,
		gap,
		text,
		onNameClick,
		onImageError,
		showImageStatus = true
	} = props;

	const [imageHasError, setImageHasError] = useState(false);

	// Handle image errors at component level
	const handleImageError = (errorSrc) => {
		setImageHasError(true);
		if (onImageError) {
			onImageError(errorSrc, id, name);
		}
	};

	// Generate avatar text from name if no text provided
	const getAvatarText = () => {
		if (text) return text;
		if (name) {
			// Get initials from name
			const names = name.trim().split(' ');
			if (names.length === 1) return names[0].charAt(0).toUpperCase();
			return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
		}
		return null;
	};

	// Get status indicator for image errors
	const getStatusIndicator = () => {
		if (!showImageStatus || !src) return null;

		if (!isValidUrl(src)) {
			return (
				<div className="avatar-status-indicator error" title="Invalid image URL">
					<WarningOutlined />
				</div>
			);
		}

		if (imageHasError) {
			return (
				<div className="avatar-status-indicator warning" title="Image failed to load">
					<LinkOutlined />
				</div>
			);
		}

		return null;
	};

	const avatarProps = {
		icon,
		src,
		type,
		size,
		shape,
		gap,
		text: getAvatarText(),
		onImageError: handleImageError
	};

	return (
		<div className="avatar-status d-flex align-items-center">
			<div className="avatar-wrapper position-relative">
				{RenderAvatar(avatarProps)}
				{/* {getStatusIndicator()} */}
			</div>
			<div className="ml-2">
				<div className="d-flex align-items-center">
					{
						onNameClick ?
							<div
								onClick={() => onNameClick({ name, subTitle1, src, id, imageHasError })}
								className="avatar-status-name clickable"
							>
								{name}
							</div>
							:
							<div className="avatar-status-name">{name}</div>
					}
					{suffix && <span className="ml-1">{suffix}</span>}
					{/* {imageHasError && showImageStatus && (
						<WarningOutlined className="ml-1 text-warning" title="Avatar image failed to load" />
					)} */}
				</div>
				<div className="text-muted avatar-status-subtitle">{subTitle1}</div>
				<div className="text-muted avatar-status-subtitle">{subTitle2}</div>
			</div>
		</div>
	)
}

AvatarStatus.propTypes = {
	name: PropTypes.string,
	src: PropTypes.string,
	type: PropTypes.string,
	onNameClick: PropTypes.func,
	onImageError: PropTypes.func,
	suffix: PropTypes.string,
	subTitle1: PropTypes.string,
	subTitle2: PropTypes.string,
	id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	icon: PropTypes.element,
	size: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
	shape: PropTypes.oneOf(['circle', 'square']),
	gap: PropTypes.number,
	text: PropTypes.string,
	showImageStatus: PropTypes.bool
}

AvatarStatus.defaultProps = {
	type: 'default',
	size: 'default',
	shape: 'circle',
	name: '',
	src: '',
	text: '',
	showImageStatus: true
}

export default AvatarStatus;