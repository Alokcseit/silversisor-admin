import ContentSection from '../models/ContentSection.js';

const getAll = async (req, res, next) => {
  try {
    const { active } = req.query;
    const filter = {};
    if (active === 'true') filter.isActive = true;
    const sections = await ContentSection.find(filter).sort({ key: 1 });
    res.json({ success: true, count: sections.length, data: sections });
  } catch (err) { next(err); }
};

const getByKey = async (req, res, next) => {
  try {
    const section = await ContentSection.findOne({ key: req.params.key, isActive: true });
    if (!section) return res.status(404).json({ success: false, message: 'Section not found' });
    res.json({ success: true, data: section });
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const section = await ContentSection.create(req.body);
    res.status(201).json({ success: true, data: section });
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const section = await ContentSection.findOneAndUpdate(
      { key: req.params.key },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!section) return res.status(404).json({ success: false, message: 'Section not found' });
    res.json({ success: true, data: section });
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    const section = await ContentSection.findOneAndDelete({ key: req.params.key });
    if (!section) return res.status(404).json({ success: false, message: 'Section not found' });
    res.json({ success: true, message: 'Section deleted' });
  } catch (err) { next(err); }
};

export { getAll, getByKey, create, update, remove };
