import CatalogService from '../models/CatalogService.js';
import SystemLog from '../models/SystemLog.js';

const getAll = async (req, res, next) => {
  try {
    const { active } = req.query;
    const filter = {};
    if (active === 'true') filter.isActive = true;
    const services = await CatalogService.find(filter).sort({ displayOrder: 1, name: 1 });
    res.json({ success: true, count: services.length, data: services });
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const service = await CatalogService.findById(req.params.id);
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
    res.json({ success: true, data: service });
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const service = await CatalogService.create(req.body);
    await SystemLog.create({ level: 'info', service: 'admin', action: 'CATALOG_SERVICE_CREATED', message: `Service "${service.name}" created` });
    res.status(201).json({ success: true, data: service });
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const service = await CatalogService.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true });
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
    await SystemLog.create({ level: 'info', service: 'admin', action: 'CATALOG_SERVICE_UPDATED', message: `Service "${service.name}" updated` });
    res.json({ success: true, data: service });
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    const service = await CatalogService.findByIdAndDelete(req.params.id);
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
    await SystemLog.create({ level: 'info', service: 'admin', action: 'CATALOG_SERVICE_DELETED', message: `Service "${service.name}" deleted` });
    res.json({ success: true, message: 'Service deleted' });
  } catch (err) { next(err); }
};

export { getAll, getById, create, update, remove };
