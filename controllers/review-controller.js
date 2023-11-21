const User = require('../models/user');

const addReview = async (req, res, next) => {
  const reviewerId = req.userId;
  const revieweeId = req.body.revieweeId;

  try {
    const reviewer = await User.findById(reviewerId);
    const reviewee = await User.findById(revieweeId);

    if (!reviewer || !reviewee) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (reviewer._id === reviewee._id) {
      return res.status(422).json({ message: 'Reviewer and reviewee cannot be same.' });
    }

    // Create a new review
    reviewee.reviews.push({
      reviewer: reviewerId,
      content: req.body.content,
    });

    await reviewee.save();

    return res.status(200).json({ message: 'Review added.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

const listReviews = async (req, res) => {
  const userId = req.userId;

  try {
    const user = await User.findById(userId).populate({
      path: 'reviews.reviewer',
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const reviews = user.reviews.map((reviews) => {
      return {
        reviewId: reviews._id,
        content: reviews.content,
        time: reviews.reviewTime,

        // Other connection-related fields
      };
    });

    return res.status(200).json(reviews);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

exports.addReview = addReview;
exports.listReviews = listReviews;
