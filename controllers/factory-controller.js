const getOneResult = async (Model, options) => {
  let results;
  try {
    results = await Model.findOne(options);
  } catch (error) {
    console.log(error);
    throw new Error('Error fetching result', 500);
  }

  return results;
};

const getOneResultPass = async (Model, options) => {
  let results;
  try {
    results = await Model.findOne(options).select('+password');
  } catch (error) {
    throw new Error('Error fetching result', 500);
  }

  return results;
};

const getAllResults = async (Model) => {
  let results;
  try {
    results = await Model.find({});
  } catch (error) {
    throw new Error('Error fetching result', 500);
  }

  return results;
};

const getOneById = async (Model, id) => {
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    throw new Error('Invalid id format');
  }

  let results;
  try {
    results = await Model.findById(id);
  } catch (error) {
    throw new Error('Error fetching result', 500);
  }

  if (!results) {
    throw new Error('No result found against id', 404);
  }

  return results;
};

exports.getOneResult = getOneResult;
exports.getOneById = getOneById;
exports.getOneResultPass = getOneResultPass;
exports.getAllResults = getAllResults;
